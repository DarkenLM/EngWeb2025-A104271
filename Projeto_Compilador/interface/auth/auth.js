const jwt    = require("jsonwebtoken");
const config = require("../../config");

module.exports.ensureTokenExists = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect("/login");
    }

    next();
};

module.exports.checkIfAuthenticated = (req) => {
    const token = req.cookies.token;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, config.SECRET);
        return decoded;
    } catch (err) {
        return null;
    }
}

module.exports.requireUserType = (allowedTypes = []) => {
    return (req, res, next) => {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Token ausente.' });

        try {
            const decoded = jwt.verify(token, config.SECRET);
            if (!allowedTypes.includes(decoded.type)) {
                return res.status(403).json({ message: 'Permissão negada.' });
            }

            next();
            } catch (err) {
                return res.status(403).json({ message: 'Token inválido.' });
        }
    };
};
