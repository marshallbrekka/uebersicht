const css = require('glamor').css;

function updateClass(oldNode, newNode) {
  if (!newNode.data.class || isEqual(newNode.data.class, oldNode.data.class)) {
    return;
  }
  newNode.elm.className = css(newNode.data.class);
}

function isEqual(oldClass, newClass) {
  return oldClass === newClass
    ? true
    : deepEqual(oldClass, newClass);
}

function deepEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false;
  }
  return !!a.find((item, idx) => item !== b[idx]);
}


exports.create = updateClass;
exports.update = updateClass;
