// middleware to serve widget bundles
module.exports = (bundler) => (req, res, next) => {
  const match = req.url.match(/\/widgets\/(.+)$/);
  if (match) {
    res.end(bundler.get(match[1]));
  } else {
    next();
  }
};
