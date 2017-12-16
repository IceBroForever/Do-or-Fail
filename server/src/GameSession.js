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
        login: playerLogin,
        streamDescription: null,
        streamIceCandidates: []
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

    if (role == 'player') {
        if (login == this.player.login) this.handlePlayerConnection(socket, login);
        else socket.terminate();
    } else {
        handleWatcherConnection(socket, login);
    }
}

GameSession.prototype.broadcast = function (data) {
    for (let watcher of this.watchers) {
        watcher.socket.send(data);
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

    this.broadcast({
        type: 'watcher-connected',
        login
    });
}

GameSession.prototype.watcherDisconnected = function (login) {
    delete this.watchers[login];

    this.broadcast({
        type: 'watcher-disconnected',
        login
    });
}

GameSession.prototype.handlePlayerConnection = function (socket, login) {
    socket.on('message', data => {
        data = JSON.parse(data);

        let { type } = data;

        switch (type) {
            case 'message': {
                this.handleMessage(this.player.login, data.message);
            } break;
            case 'description': {
                this.player.streamDescription = data.description;
            } break;
            case 'ice-candidate': {
                this.player.streamIceCandidates.push(data.iceCandidate);
            } break;
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

GameSession.prototype.handleWatcherConnection = function (socket, login) {

    socket.on('message', data => {
        data = JSON.parse(data);
        let { type } = data;

        switch (type) {
            case 'message': {
                this.handleMessage(login, data.message);
            } break;
        };
    });

    socket.on('close', () => {
        this.watcherDisconnected(login);
    });

    this.watcherConnected(login, socket);

    socket.send(JSON.stringify({
        type: 'stream-staff',
        description: this.player.streamDescription,
        iceCandidates: this.player.streamIceCandidates
    }));
}

GameSession.prototype.closeSession = function () {
    this.server.close(() => this.deleteCallback());
}

module.exports = GameSession;