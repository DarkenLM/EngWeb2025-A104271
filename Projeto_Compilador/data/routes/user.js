const { SECRET } = require("../../config.js");
const userController = require("../controllers/user.js");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const userModel = require("../models/user.js");
const Auth = require('../auth/auth.js')
const jwt = require('jsonwebtoken');

router.post("/register", async function(req, res, next) {
    try{
        let existingEmail = await userController.findByEmail(req.body.email);
        let existingUsername = await userController.findByUsername(req.body.username);

        if (!existingEmail && !existingUsername) {
            userModel.register(
                new userModel({
                    username: req.body.username,
                    fname: req.body.fname,
                    lname: req.body.lname,
                    email: req.body.email,
                    avatar : req.body.avatar,
                    type: req.body.type
                }),
                req.body.password,
                (err, user) => {
                    if (err) return res.status(500).jsonp(err);
                    else {
                        console.log(`User successfully registered. ${user}`);
                        return res.send(user);
                    }
                }
            );
        } else {
            let errorMessage = "";
            if (existingEmail) {
                errorMessage = "O email inserido já está em uso.";
            } else if (existingUsername) {
                errorMessage = "O nome do utilizador inserido já está em uso.";
            }

            return res.status(400).json({ message: errorMessage });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).jsonp({ message: "Erro interno no servidor. "});
    }
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ 
                message: "Nome do utilizador ou palavra-passe incorretos." 
            });
        }
        
        jwt.sign({
                username: user.username,
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                type: user.type
            },
            SECRET,
            { expiresIn: 86400 }, // 1 dia
            (err, token) => {
                if (err) {
                    return res.status(500).json({ 
                        message: "Erro ao gerar token de autenticação" 
                    });
                }
                
                return res.status(201).json({ token: token });
            }
        );
    })(req, res, next);
});

router.get("/profile", Auth.validate, function(req, res, next) {
    const username = req.user.username;
    console.log("Looking for user:", username);

    userController.findByUsername(username)
        .then(user => {
            if (!user) {
                return res.status(404).send({ error: "User not found" });
            }
            res.json(user);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ error: "Database error" });
        });
});

router.put("/profile", Auth.validate, async function(req, res, next) {
    const username = req.user.username;
    console.log("[INFO] - Updating user: ", username);

    console.log("-- Old user --");
    console.log(req.user);
    
    try {
        let isUsernameTaken = null;
        let isEmailTaken = null;
        
        //Se o nome que vem é o mesmo que o atual, passar esta verificação a frente
        if(req.body.username !== req.user.username){
            isUsernameTaken = await userController.findByUsername(req.body.username);
        }
        //Se o email que vem é o mesmo que o atual, passar esta verificação a frente
        if(req.body.email !== req.user.email){
            isEmailTaken = await userController.findByEmail(req.body.email);
        }

        //console.log(newUsername);
        
        if(isUsernameTaken !== null){
            return res.status(409).json({
                code: 409.1,
                message: "Username is already taken"
            });
        }
        if(isEmailTaken !== null){
            return res.status(409).json({
                code: 409.2,
                message: "Email is already taken"
            });
        }

        const updatedUser = await userController.findByUsernameAndUpdate(req.user.username, req.body);
        
        const token = jwt.sign({
            username: updatedUser.username,
            fname: updatedUser.fname,
            lname: updatedUser.lname,
            email: updatedUser.email,
            type: updatedUser.type
        }, SECRET, { expiresIn: 86400 });
        
        console.log("-- New user --");
        jwt.verify(token, SECRET, (err, payload) => {
            console.log(payload);
        }); 
        res.status(200).json({ user: updatedUser, token });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: "Failed to update user" });
    }
});

//TODO: Este é o que pode ser alterado para adicionar ao vault aqui
router.post("/avatar", Auth.validate, (req, res) => {
    const username = req.user.username; 
    const { checksum } = req.body;

    if (!checksum) {
        return res.status(400).json({ message: "Checksum é obrigatório" });
    }

    console.log("[INFO] - Updating avatar for user: ", username);

    userController.findByUsernameAndUpdateAvatar(username, checksum)
        .then(updatedUser => {
            res.json({ user: updatedUser });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Erro ao atualizar avatar." });
        });
});

router.put("/profile/password", Auth.validate, async function(req, res, next) {
    const username = req.user.username;
    const user = await userController.findByUsername(req.user.username);
    
    const currentPassword = req.body.currentPassword; 
    const newPassword = req.body.newPassword;
    
    console.log("[INFO] - Updating ", username, " password");
    
    user.authenticate(currentPassword, (err, result, passwordErr) => {
        if (err || !result) {
            return res.status(400).json({
                code: 400.0,
                message: "Password is incorrect"
            });
        }

        user.setPassword(newPassword, (err) => {
            if (err) {
                return res.status(500).send("Could not set new password");
            }
            user.save();
            res.send(req.user);
        });
    });
});

router.get("/spec", async (req, res, next) => {
    try {
        const users = await userController.findAllUsersSpec();
        res.status(200).json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/produtores", async (req, res, next) => {
    try {
        const users = await userController.findAllProdutores();
        res.status(200).json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        await userController.delete(req.params.id);
        res.status(200);
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/:username', async (req, res, next) => {
    try {
        const { username } = req.params;

        const user = await userController.findByUsername(username);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userInfo = {
            username: user.username,
            fname: user.fname,
            lname: user.lname,   
            email: user.email,
            avatar: user.avatar
        };

        res.status(200).json({ userInfo });

    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;