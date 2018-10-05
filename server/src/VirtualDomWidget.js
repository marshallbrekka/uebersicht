const RenderLoop = require('./RenderLoop');
const Timer = require('./Timer');
const runCommand = require('./runCommand');
const ReactDom = require('react-dom');
const html = require('react').createElement;
const ErrorDetails = require('./ErrorDetails');
window.html = html;

const defaults = {
  id: 'widget',
  refreshFrequency: 1000,
  init: function init() {},
  render: function render(props) {
    return html('div', null, props.output);
  },
  updateState: function updateState(action) {
    if (action.type === 'UB/COMMAND_RAN') {
      return { error: action.error, output: action.output };
    }
    return props;
  },
  initialState: { output: '', error: null },
};

module.exports = function VirtualDomWidget(widgetObject) {
  const api = {};
  let implementation;
  let contentEl;
  let commandLoop;
  let renderLoop;
  let currentError;

  function init(widget) {
    currentError = widget.error ? JSON.parse(widget.error) : undefined;
    implementation = Object.create(defaults);
    Object.assign(implementation, widget.implementation || {}, {id: widget.id});
    return api;
  }

  function start() {
    if (currentError) {
      renderErrorDetails(currentError);
      return;
    }
    if (renderLoop) {
      renderLoop.update(renderLoop.state); // force redraw
    } else {
      renderLoop = RenderLoop(implementation.initialState, render);
    }
    run();
  }

  function run() {
    implementation.init(dispatch);
    commandLoop = Timer().start().map((done) => {
      try {
        runWidgetCommand(done);
      } catch (err) {
        handleError(err);
      }
    });
  }

  function runWidgetCommand(done) {
    runCommand(
      implementation,
      (err, output) => {
        dispatch({ type: 'UB/COMMAND_RAN', error: err, output: output });
        done(implementation.refreshFrequency);
      },
      dispatch
    );
  }

  function dispatch(action) {
    try {
      const nextState = implementation.updateState(action, renderLoop.state);
      renderLoop.update(nextState);
    } catch (err) {
      handleError(err);
    }
  }

  function fetchErrorDetails(err) {
    return fetch(
      `/widgets/${widgetObject.id}?line=${err.line}&column=${err.column}`
      )
      .then(res => res.json());
  }

  function render(state) {
    try {
      ReactDom.render(implementation.render(state, dispatch), contentEl);
    } catch (err) {
      handleError(err);
    }
  }

  function handleError(err) {
    currentError = err;
    commandLoop.stop();
    fetchErrorDetails(err).then(details => {
      if (err !== currentError) return;
      renderErrorDetails(Object.assign({message: err.message}, details));
    });
  }

  function renderErrorDetails(details) {
    ReactDom.render(html(ErrorDetails, details), contentEl);
  }

  api.create = function create() {
    contentEl = document.createElement('div');
    contentEl.id = implementation.id;
    contentEl.className = 'widget';
    document.body.appendChild(contentEl);
    start();
    return contentEl;
  };

  api.destroy = function destroy() {
    commandLoop && commandLoop.stop();
    if (contentEl && contentEl.parentNode) {
      contentEl.parentNode.removeChild(contentEl);
    }
    renderLoop = null;
    contentEl = null;
    currentError = null;
  };

  api.update = function update(newImplementation) {
    commandLoop && commandLoop.stop();
    init(newImplementation);
    start();
  };

  api.forceRefresh = function forceRefresh() {
    commandLoop.forceTick();
  };

  return init(widgetObject);
};
