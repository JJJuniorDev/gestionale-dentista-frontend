// server.js
const express = require("express");
const { ExpressPeerServer } = require("peer");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = 9000;

// Crea il server PeerJS
const peerServer = ExpressPeerServer(server, {
  path: "/peerjs", // Percorso di PeerJS
});

app.use("/peerjs", peerServer); // Usa PeerJS in un percorso specifico

server.listen(port, () => {
  console.log(`PeerJS server running at http://localhost:${port}`);
});
