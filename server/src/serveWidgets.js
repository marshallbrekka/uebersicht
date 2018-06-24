const URL = require('url');
const fs = require('fs');
const SourceMapConsumer = require('source-map').SourceMapConsumer;
const convert = require('convert-source-map');
const {Transform} = require('stream');
const byline = require('byline');

// middleware to serve widget bundles
module.exports = (bundler) => (req, res, next) => {
  const url = URL.parse(req.url, true);
  const match = url.pathname.match(/\/widgets\/(.+)$/);
  if (match) {
    const code = bundler.get(match[1]);
    if (!code) {
      res.writeHead(404);
      return res.end();
    }
    return url.search ? codeLines(code, url.query, res) : res.end(code);
  }

  return next();
};

function grabLines(lineNum, padding) {
  let i = 0;
  return new Transform({
    transform(line, _, next) {
      if (i >= lineNum - padding && i < lineNum + padding) {
        this.push(i + 1 + ': ' + line + '\n', 'utf8');
      }
      i++;
      next();
    },
  });
}

function codeLines(source, options, res) {
  const padding = 5;
  const lineNum = Number(options.line) || 0;
  const column = Number(options.column) || 0;
  const converter = convert.fromSource(source);

  if (!converter) {
    res.writeHead(404);
    res.end('could not find sourcemap comment');
    return;
  }

  SourceMapConsumer.with(converter.toObject(), null, (smc) => {
    var origpos = smc.originalPositionFor({ line: lineNum, column: column });
    if (!origpos.source) {
      res.writeHead(404);
      res.end('no match found for line ' + lineNum + ':' + column + '\n');
      return;
    }
    byline(fs.createReadStream(origpos.source), {keepEmptyLines: true})
      .pipe(grabLines(origpos.line, padding))
      .pipe(res)
      .on('error', err => {
        res.writeHead(500);
        res.end(err.message);
      });
  });
}
