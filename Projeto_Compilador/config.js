let crypto = require('crypto');

//const SECRET = crypto.randomBytes(64).toString('hex');
//console.log(SECRET);

//TODO:
//TODO:
//TODO: THIS SHIT IS HARDCODED
const SECRET = "e41adab10a9755099a9e2fd427a14b5c2ac461614adffa94bfaf2bd69ae6fd9ab21036a04c24441c84ff00607e78e422646cd391adf984e430afb91ba9acb8d7";
const uploadFolder = "uploads/";
const types = [
  "reflexao",
  "educacao",
  "desenvolvimento-pessoal",
  "saude-mental",
  "desporto",
  "tecnologia",
  "vida-academica",
  "criatividade",
  "identidade",
  "relacionamentos",
  "motivacao",
  "cultura-digital",
  "trabalho",
  "autoestima",
  "voluntariado",
  "musica",
  "ambiente",
  "viagens",
  "opinioes",
  "futuro"
];

module.exports = { SECRET, uploadFolder, types };