const express = require("express");
const router  = express.Router();
const axios   = require("axios");
const jwt     = require("jsonwebtoken");
const { checkIfAuthenticated } = require("../auth/auth");

const path = require("path");
const fs = require("fs");

//#region register

router.get("/register", function(req, res, next) {
	const user = checkIfAuthenticated(req);

	if (user) {
		let redirectPath;
		switch (user.type) {
			case "consumidor"    : redirectPath = "/consumidor/feed"; break;
			case "produtor"      : redirectPath = "/produtor/dashboard"; break;
			case "administrador" : redirectPath = "/administrador/utilizadores"; break;
			default              : redirectPath = "/";
		}

		return res.redirect(redirectPath);
	}
	
  	res.status(200).render("common/registerPage");
});

router.post("/register", async function(req, res, next) {
	const cookieUser = checkIfAuthenticated(req);
	
	if (cookieUser) {
		let redirectPath;
		switch (cookieUser.type) {
			case "consumidor"    : redirectPath = "/consumidor/feed"; break;
			case "produtor"      : redirectPath = "/produtor/dashboard"; break;
			case "administrador" : redirectPath = "/administrador/utilizadores"; break;
			default              : redirectPath = "/";
		}
		
		return res.redirect(redirectPath);
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
			return res.status(400).render("common/registerPage", {
				errors
			});
		}

		await axios.post("http://localhost:3000/user/register", user);

		res.status(201).redirect("/login");
	} catch (err) {
		if (err.response) {
			console.log(`Error on register: ${err.response.data.message}`);
			return res.status(400).render("common/registerPage", { errors: [err.response.data.message] });
		} else {
			console.log(`Error on register: ${err}`);
			return res.status(500).render("error", {error: err});
		}
	}
});
//#endregion

//#region login
router.get("/login", function(req, res, next) {
	const user = checkIfAuthenticated(req);

	if (user) {
		let redirectPath;
		switch (user.type) {
			case "consumidor"    : redirectPath = "/consumidor/feed"; break;
			case "produtor"      : redirectPath = "/produtor/dashboard"; break;
			case "administrador" : redirectPath = "/administrador/utilizadores"; break;
			default              : redirectPath = "/";
		}

		return res.redirect(redirectPath);
	}

    res.status(200).render("common/loginPage");
});

router.post("/login", async function(req, res, next) {
	const user = checkIfAuthenticated(req);

	if (user) {
		let redirectPath;
		switch (user.type) {
			case "consumidor"    : redirectPath = "/consumidor/feed"; break;
			case "produtor"      : redirectPath = "/produtor/dashboard"; break;
			case "administrador" : redirectPath = "/administrador/utilizadores"; break;
			default              : redirectPath = "/";
		}

		return res.redirect(redirectPath);
	}

	try {
		const response = await axios.post("http://localhost:3000/user/login", {
			username: req.body.username,
			password: req.body.password
    	});

		const token = response.data.token;
		res.cookie("token", token, { httpOnly: false });
		const decoded = jwt.decode(token);
		let link;
		console.log(decoded)

		switch (decoded.type) {
			case "consumidor"    : link = "/consumidor/feed"; break;
			case "produtor"      : link = "/produtor/dashboard"; break;
			case "administrador" : link = "/administrador/utilizadores"; break;
			default              : link = "/login";
		}

		res.status(201).redirect(link);
	} catch (err) {
		if (err.response) {
			console.log(`Error on login: ${err.response.data.message}`);
			return res.status(400).render("common/loginPage", { errors: [err.response.data.message] });
		} else {
			console.log(`Error on login2: ${err}`);
			res.status(500).render("error", { error: err });
		}
	}
});
//#endregion

//#region logout
router.get("/logout", function(req, res, next) {
	// console.log("[INFO] - Logged out!");
	// console.log("[INFO] - Token deleted!");
    res.clearCookie('token');
	res.status(201).redirect("/login");
});
//#endregion

router.get("/vault/:checksum", (req, res) => {
	const checksum = req.params.checksum;
	if (!checksum || checksum.length < 2) {
		return res.status(400).send('Checksum inválido');
	}
	
	// Extrai as duas primeiras chars para a pasta e o resto para o ficheiro
	const folder = checksum.substring(0, 2);
	const file = checksum.substring(2);
	
	const filePath = path.join(__dirname, '/../../vault', folder, file);
	console.log("Tentando servir:", filePath);

	fs.access(filePath, fs.constants.R_OK, (err) => {
		if (err) {
			console.error('Ficheiro não encontrado ou inacessível:', filePath);
			return res.status(404).send('Ficheiro não encontrado');
		}
		res.sendFile(filePath);
	});
});

module.exports = router;