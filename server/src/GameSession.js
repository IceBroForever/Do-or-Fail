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

function GameSession(playerLogin) {
    this.player = {
        socket: null,
        login: playerLogin
    };
    this.watchers = {};
    this.currentTask = null;

    this.server = new WebSocket.Server({ 
        noServer: true,
        verifyClient: () => {
            return this.verifyClient();
        }
    });

    this.server.on('connection', (socket, req) => {
        this.handleConnection(socket, req);
    })
}

GameSession.prototype.verifyClient = function (info) {
    // let { req } = info;
    // let url = Url.parse(req.url, true);
    // let { login, role, token } = url.query;

    // try {
    //     let decoded = jwt.verify(token, process.env.SERVER_SECRET);
    //     if(decoded.login != login || decoded.role != role) return false;

    //     if (role == 'player') {
    //         if(login == this.player.login) return true;
    //         return false;
    //     }

    //     return true;
    // } catch (error) {
    //     return false;
    // }
    return true;
}

GameSession.prototype.handleConnection = function (socket, req) {
    let url = Url.parse(req.url, true);
    let { login, role } = url.query;

    if(role == 'player'){
        if(login == this.player.login) this.handlePlayerConnection(socket, login);
        else socket.terminate();
    } else {
        handleWatcherConnection(socket, login);
    }
}

GameSession.prototype.handlePlayerConnection = function (socket, login){
    
}

GameSession.prototype.handleWatcherConnection = function (socket, login){
    
}

module.exports = GameSession;