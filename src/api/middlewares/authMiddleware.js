const jwt = require('jsonwebtoken');
const tokenSecretKey = 'defaultSecretKey';

function authMiddleware(req, res, next) {
    next();
}

module.exports = authMiddleware;
