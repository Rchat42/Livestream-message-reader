const path = require("path");
const fs = require("fs");
const http = require("http");
const ws = require("ws");
const portHttp = 3000;
const portWs = 3001;

const wsServer = new ws.WebSocketServer({
    port: portWs,
    autoPong: true
});

wsServer.on("connection", (socket) => {
    socket.on("message", (mess) => {
        wsServer.clients.forEach(client => {
            if (client === socket) {
                return;
            }
            client.send(String(mess));
        });
    });
});

http.createServer((req, res) => {
    switch (req.url) {
        case ("/"): {
            res.writeHead(200);
            res.end(fs.readFileSync(path.join(__dirname, "webpage", "index.html"), "utf-8"));
            break;
        }
        case ("/style.css"): {
            res.writeHead(200);
            res.end(fs.readFileSync(path.join(__dirname, "webpage", "style.css"), "utf-8"));
            break;
        }
        case ("/script.js"): {
            res.writeHead(200);
            res.end(fs.readFileSync(path.join(__dirname, "webpage", "script.js"), "utf-8"));
            break;
        }
        default: {
            res.writeHead(404);
            res.end();
            break;
        }
    }
}).listen(portHttp);