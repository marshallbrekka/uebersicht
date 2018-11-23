module.exports = (token) => {
  const validSessionCookie = `token=${token}`;
  return (req, res, next) => {
    if (req.headers.cookie === validSessionCookie) return next();
    res.writeHead(401);
    res.end();
  }
}
