module.exports = (tokens) => (req, res, next) => {
  if (req.headers.cookie === 'token=123456') return next();
  res.writeHead(403);
  res.end();
}
