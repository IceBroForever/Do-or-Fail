const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '../.env')
})

const WebSocket = require('ws'),
    Url = require('url'),
    jwt = require('jsonwebtoken');

const playerDB = require('../db/player'),
    watcherDB = require('../db/watcher'),
    taskDB = require('../db/task');

function GameSession(playerLogin, deleteCallback) {
    this.player = {
        socket: null,
        login: playerLogin
    };

    this.watchers = {};

    this.currentTask = null;

    this.server = new WebSocket.Server({
        noServer: true,
        verifyClient: (info) => {
            return this.verifyClient(info);
        }
    });

    this.server.on('connection', (socket, req) => {
        this.handleConnection(socket, req);
    })

    this.deleteCallback = deleteCallback;
}

GameSession.prototype.verifyClient = function (info) {
    let { req } = info;
    let url = Url.parse(req.url, true);
    let { login, role, token } = url.query;

    try {
        let decoded = jwt.verify(token, process.env.SERVER_SECRET);
        if (decoded.login != login || decoded.role != role) return false;

        if (role == 'player') {
            if (login == this.player.login) return true;
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
    return true;
}

GameSession.prototype.handleUpgrade = function (req, socket, head) {
    this.server.handleUpgrade(req, socket, head, (webSocket) => {
        this.server.emit('connection', webSocket, req);
    });
}

GameSession.prototype.handleConnection = function (socket, req) {
    let url = Url.parse(req.url, true);
    let { login, role } = url.query;

    console.log(login);

    if (role == 'player') {
        if (login == this.player.login) this.handlePlayerConnection(socket, login);
        else socket.terminate();
    } else {
        this.handleWatcherConnection(socket, login);
    }
}

GameSession.prototype.broadcast = function (data) {
    for (let watcher in this.watchers) {
        this.watchers[watcher].send(data);
    }

    this.player.socket.send(data);
}

GameSession.prototype.handleMessage = function (login, message) {
    this.broadcast(JSON.stringify({
        type: 'message',
        sender: login,
        message
    }));
}

GameSession.prototype.watcherConnected = function (login, socket) {
    this.watchers[login] = socket;

    this.broadcast(JSON.stringify({
        type: 'watcher-connected',
        login
    }));
}

GameSession.prototype.watcherDisconnected = function (login) {
    delete this.watchers[login];

    this.broadcast(JSON.stringify({
        type: 'watcher-disconnected',
        login
    }));
}

GameSession.prototype.handlePlayerConnection = function (socket, login) {
    socket.on('message', data => {
        data = JSON.parse(data);

        let { type } = data;

        switch (type) {
            case 'message': {
                this.handleMessage(this.player.login, data.message);
            } break;
            case 'offer': {
                let { description, iceCandidates } = data;
                this.sendStreamInfoToWatcher(data.login, description, iceCandidates);
            }
        };
    });

    socket.on('close', () => {
        this.closeSession();
    });

    this.player.socket = socket;

    socket.send(JSON.stringify({
        type: 'ok'
    }));
}

GameSession.prototype.sendStreamInfoToWatcher = function (login, description, iceCandidates) {
    this.watchers[login].send(JSON.stringify({
        type: 'offer',
        description,
        iceCandidates
    }));
}

GameSession.prototype.handleWatcherConnection = function (socket, login) {

    socket.on('message', data => {
        data = JSON.parse(data);
        let { type } = data;

        switch (type) {
            case 'message': {
                this.handleMessage(login, data.message);
            } break;
            case 'answer': {
                this.sendStreamInfoToPlayer(login, data.description);
            }
        };
    });

    socket.on('close', () => {
        this.watcherDisconnected(login);
    });

    this.watcherConnected(login, socket);

    socket.send(JSON.stringify({
        type: 'ok'
    }));
}

GameSession.prototype.sendStreamInfoToPlayer = function (login, description) {
    this.player.socket.send(JSON.stringify({
        type: 'answer',
        login,
        description
    }));
}

GameSession.prototype.closeSession = function () {
    this.server.close(() => this.deleteCallback());
}

module.exports = GameSession;