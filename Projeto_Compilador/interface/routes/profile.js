const express = require("express");
const axios = require("axios");
const multer  = require("multer");
const fs      = require("fs");
const crypto  = require("crypto");
const path    = require("path");
const config  = require("../../config.js");

const { ensureTokenExists } = require("../auth/auth");

// TODO: Talvez mudar isto para Validation.xxx if have time, more clean 
const { 
    validateUsername, 
    validateFirstName,
    validateLastName,
    validateEmail,
    validatePassword } = require("../validator");
    
const router = express.Router();
const upload = multer({ dest: config.uploadFolder });

router.get("/", ensureTokenExists, function(req, res, next) {
    const token = req.cookies.token;

    axios.get("http://localhost:3000/user/profile", {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    })
    .then(response => {
        const user = response.data;
        res.render("common/profile", { user });
    })
    .catch(err => {
        console.error("Token verification failed:", err.response?.data || err);
        res.redirect("/login");
    });
});

router.put("/", ensureTokenExists,function(req, res, next) {
    const token = req.cookies.token;

    // 🔒 Frontend-server validation
    if (!validateUsername(req.body.username)) {
        return res.status(400).send({ code: 400.1, message: "Username inválido" });
    }

    if (!validateFirstName(req.body.fname)) {
        return res.status(400).send({ code: 400.2, message: "Primeiro nome inválido" });
    }

    if (!validateLastName(req.body.lname)) {
        return res.status(400).send({ code: 400.3, message: "Último nome inválido" });
    }

    if (!validateEmail(req.body.email)) {
        return res.status(400).send({ code: 400.4, message: "Email inválido" });
    }

    axios.put("http://localhost:3000/user/profile", req.body, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    })
    .then(response => {
        const user = response.data.user;
		console.log("[INFO] - Token REgenerated!");
		res.cookie("token", response.data.token, { httpOnly: false });
        res.render("common/profile", { user });
    })
    .catch(err => {
        if(err.status === 409){
            console.log("[INFO] - " + err.response.data.message);
            return res.status(409).json(err.response.data);
        }
        console.error("Token verification failed:", err.response?.data || err);
        res.redirect("/login");
    });
});

router.get("/password", function(req, res, nex) {
	res.render("common/profilePass");
})

// TODO: Para ser mais coerente, isto deveria ser um put (atualização)
router.post("/password", ensureTokenExists, function(req, res, next) {
    const token = req.cookies.token;

    if (!validatePassword(req.body.newPassword)) {
        return res.status(400).send({ code: 400, message: "Password nova com formato inválido" });
    }

    axios.put("http://localhost:3000/user/profile/password", req.body, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        withCredentials: true
    })
    .then(response => {
        const user = response.data.user;
        res.render("common/profile", { user });
    })
    .catch(err => {
        if(err.status === 400){
            console.log("[INFO] - " + err.response.data.message);
            return res.status(400).json(err.response.data);
        }
        console.error("Token verification failed:", err.response?.data || err);
        res.redirect("/login");
    });
});


router.post("/avatar", upload.single("avatar"), function(req, res) {
    const token = req.cookies.token;

    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const checksum = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    // Guardar no vault
    const folder = checksum.slice(0, 2);
    const filename = checksum.slice(2);
    const vaultDir = path.join(__dirname, "../../vault", folder);
    const vaultPath = path.join(vaultDir, filename);

    fs.mkdirSync(vaultDir, { recursive: true });
    fs.writeFileSync(vaultPath, fileBuffer);
    fs.unlinkSync(filePath); // Apagar ficheiro temporário do upload

    // Enviar só o checksum para a API
    axios.post("http://localhost:3000/user/avatar", { checksum }, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
        const user = response.data.user;
        console.log("[INFO] - Avatar updated via checksum.");
        res.render("common/profile", { user });
    })
    .catch(err => {
        console.error("[ERROR] - Avatar upload failed:", err.response?.data || err);
        res.redirect("/login");
    });
});

module.exports = router;