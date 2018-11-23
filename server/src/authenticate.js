const stream = require('stream');
module.exports = (identity, indexHTML) => {
  const validCookie = `identity=${identity}`;
  return (req, res, next) => {
    if (req.headers.cookie !== validCookie) return next();
    res.writeHead(200, {
      'Set-Cookie': 'token=123456; Domain=127.0.0.1; HttpOnly; SameSite=Strict',
      'Content-Type': 'text/html'
    });
    const bufferStream = new stream.PassThrough();
    bufferStream.pipe(res);
    bufferStream.end(indexHTML);
  }
};
