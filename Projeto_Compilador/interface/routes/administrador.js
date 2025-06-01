const express = require("express");
const axios   = require("axios");
const router  = express.Router();

const { checkIfAuthenticated } = require("../auth/auth.js");

//#region Noticias
router.get("/noticias", async function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "administrador") {
        return res.redirect("/login");
    }
    
    let data = await axios.get("http://localhost:3000/noticia");
    res.render("administrador/noticias/feed", { noticias: data.data });
});

router.get("/noticias/:id", async function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "administrador") {
        return res.redirect("/login");
    }
    
    let data = await axios.get("http://localhost:3000/noticia/" + req.params.id);
    res.render("administrador/noticias/individual", { noticia: data.data });
});

router.get("/noticias/criar", function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "administrador") {
        return res.redirect("/login");
    }

    res.render("administrador/noticias/criar");
});

router.post("/noticias/criar", async function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "administrador") {
        return res.redirect("/login");
    }

    const { title, description, visibility } = req.body;

    if (!title || !description) {
        return res.render("administrador/noticias/criar", { errors: ["Todos os campos são obrigatórios."] });
    }

    const noticia = {
        title,
        description,
        visibility: visibility === "on",
        created_at: new Date(),
        author: user.username
    };

    await axios.post("http://localhost:3000/noticia", noticia);

    res.redirect("/administrador/noticias");
});

router.put("/noticias/:id", async function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "administrador") {
        return res.redirect("/login");
    }

    let data = req.body;
    await axios.put("http://localhost:3000/noticia/" + req.params.id, data);

    res.redirect("/administrador/noticias");
});

router.delete("/noticias/:id", async function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "administrador") {
        return res.redirect("/login");
    }

    await axios.delete("http://localhost:3000/noticia/" + req.params.id);

    res.redirect("/administrador/noticias");
});
//#endregion

































router.get("/utilizadores", function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "administrador") {
        return res.redirect("/login");
    }

    axios.get("http://localhost:3000/user/spec").then( response => {
        let data = response.data;

        res.status(200).render("administrador/adminUsers", { users: data });
    }).catch( err => {
        // TODO
    });
});

router.get("/entradas", async function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "administrador") {
        return res.redirect("/login");
    }

    const search = req.query.search || "";

    try {
        // Monta a URL da API /posts com parâmetros conforme search
        let apiUrl = "http://localhost:3000/posts?visible=true&limit=20";

        if (search.trim() !== "") {
            // Se search existe, manda só search (sem limit ou visible, já que a API ignora outros filtros em search)
            apiUrl = `http://localhost:3000/posts?search=${encodeURIComponent(search)}`;
        }

        const response = await axios.get(apiUrl);

        const posts = response.data;

        res.render('administrador/entradas', { posts: posts, search: search });

    } catch (err) {
        console.error("Erro ao buscar posts:", err.message);
        res.status(500).send("Erro ao carregar o feed.");
    }
});

router.get("/utilizadores/criar", function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "administrador") {
        return res.redirect("/login");
    }

    res.status(200).render("administrador/adminCreateUser");
});

router.post("/utilizadores/criar", async function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "administrador") {
        return res.redirect("/login");
    }

    try {
        const user = {
            username: req.body.username,
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            avatar: "",
            password: req.body.password,
            type: req.body.userType
        };

        const errors = [];

        if (!user.username || !/^[a-zA-Z0-9_]+$/.test(user.username)) {
            errors.push("Nome de utilizador inválido (apenas letras, números e underscores).");
        }

        if (!user.fname || !/^[A-Z][a-z]+$/.test(user.fname)) {
            errors.push("Nome próprio é obrigatório e deve começar por uma letra maiúscula.");
        }

        if (!user.lname || !/^[A-Z][a-z]+$/.test(user.lname)) {
            errors.push("Apelido é obrigatório e deve começar por uma letra maiúscula.");
        }

        if (!user.email || !/^[^@]+@[^@]+\.[^@]+$/.test(user.email)) {
            errors.push("Email inválido.");
        }

        if (!user.password || !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$%*#?&!^])[A-Za-z\d@$%*#?&!^]{8,}$/.test(user.password)) {
            errors.push(`A palavra-passe deverá ter, pelo menos, 8 caracteres, 1 letra, 1 número e 1 caractere especial.`);
        }

        if (!["consumidor", "produtor", "administrador"].includes(user.type)) {
            errors.push("Tipo de utilizador inválido.");
        }

        if (errors.length > 0) {
            return res.status(400).render("administrador/utilizadores/criar", {
                errors
            });
        }

        await axios.post("http://localhost:3000/user/register", user);

        res.status(201).redirect("/administrador/utilizadores");
    } catch (err) {
        if (err.response) {
            console.log(`Error on admin panel user register: ${err.response.data.message}`);
            return res.status(400).render("administrador/utilizadores/criar", { errors: [err.response.data.message] });
        } else {
            console.log(`Error on admin panel user register: ${err}`);
            return res.status(500).render("error", {error: err});
        }
    }
});

router.get("/utilizadores/:username", function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "administrador") {
        return res.redirect("/login");
    }

    let username = req.params.username;
    axios.get("http://localhost:3000/user/" + username).then( response => {
        let data = response.data;

        res.status(200).render("administrador/adminEditUser", { user: data.userInfo });
    }).catch( err => {
        // TODO
    });
})

router.delete("/utilizadores/:id", function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "administrador") {
        return res.redirect("/login");
    }

    let id = req.params.id;

    axios.delete("http://localhost:3000/user/" + id).then( _ => {
        res.status(200).redirect("/administrador/utilizadores");
    }).catch( err => {
        // TODO
    });
})

module.exports = router;