const { SECRET } = require('../../config.js');
let jwt = require('jsonwebtoken')

module.exports.validate = (req, res, next) => {
    let token = req.query.token || req.body.token || req.get('Authorization');

    if (!token) return res.status(401).json({ error: "No token provided" });

    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    jwt.verify(token, SECRET, (err, payload) => {
        if (err) return res.status(401).json({ error: "Invalid token" });
        req.user = payload;
        next();
    });
};


module.exports.validateDoc = (req, res, next) => {
    let token = req.query.token || req.body.token || req.get('Authorization')

    token = token.split(' ')[1]

    if(token){
        jwt.verify(token, SECRET, (err, payload) => {
            if(err) res.status(401).jsonp(err)
            else {
                console.log(payload)
                if(payload.type = "ADMIN"){
                    next()
                } else {
                    res.status(401).jsonp(payload)
                }
                next()
            } 
        })
    } else {
        res.status(401).jsonp({error: "Token inexistente"})
    }
}