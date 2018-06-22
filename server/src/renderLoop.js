var raf = require('raf');
const ReactDom = require('react-dom');

module.exports = function RenderLoop(initialState, render, target) {
  var currentState = null;
  var oldNode = target;
  var redrawScheduled = false;
  var inRenderingTransaction = false;

  var loop = {
    state: initialState,
    target: target,
    update: update,
  };

  function update(state) {
    if (inRenderingTransaction) {
      throw Error("can't update while rendering");
    }

    if (currentState === null && !redrawScheduled) {
      redrawScheduled = true;
      raf(redraw);
    }

    currentState = state;
    loop.state = currentState;
    return loop;
  }

  function redraw() {
    redrawScheduled = false;
    if (currentState === null) {
      return;
    }

    inRenderingTransaction = true;
    ReactDom.render(render(currentState), target);
    inRenderingTransaction = false;
    currentState = null;
  }

  return update(initialState);
};
