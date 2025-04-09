function headerMiddleware(req, res, next) {
  // Set CORS headers
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}

module.exports = headerMiddleware;