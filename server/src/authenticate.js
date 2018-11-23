const stream = require('stream');
module.exports = (identity, token, indexHTML) => {
  const validAuthCookie = `identity=${identity}`;
  const session = `token=${token}; Domain=127.0.0.1; HttpOnly; SameSite=Strict`;
  const sessionHeaders = {'Set-Cookie': session, 'Content-Type': 'text/html'};
  return (req, res, next) => {
    if (req.headers.cookie !== validAuthCookie) return next();
    res.writeHead(200, sessionHeaders);
    const bufferStream = new stream.PassThrough();
    bufferStream.pipe(res);
    bufferStream.end(indexHTML);
  }
};
