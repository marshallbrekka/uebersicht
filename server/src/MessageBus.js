'use strict';

const WebSocket = require('ws');

module.exports = function MessageBus(options) {
  const wss = new WebSocket.Server(options);

  const sessionCookie = `token=${options.sessionToken}`;
  wss.shouldHandle((req) => req.headers.cookie === sessionCookie);

  function broadcast(data) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  wss.on('connection', (ws) => ws.on('message', broadcast));
  wss.on('error', (err) => console.error(err));

  return wss;
};
