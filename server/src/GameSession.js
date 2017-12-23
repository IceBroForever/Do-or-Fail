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

const statuses = {
    WAITING_FOR_TASK: 'WAITING_FOR_TASK',
    WAITING_FOR_CONFIRMING: 'WAITING_FOR_CONFIRMING',
    DOING_TASK: 'DOING_TASK'
}

function GameSession(playerLogin, deleteCallback) {
    this.player = {
        socket: null,
        login: playerLogin
    };

    this.watchers = {};

    this.currentTask = null;
    this.status = statuses.WAITING_FOR_TASK;

    this.server = new WebSocket.Server({
        noServer: true,
        verifyClient: (info) => {
            return this.verifyClient(info);
        },
        clientTracking: false
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
        this.handleWatcherConnection(socket, login);
    }
}

GameSession.prototype.broadcast = function (data) {
    for (let watcher in this.watchers) {
        if (this.watchers[watcher].readyState == 1) this.watchers[watcher].send(data);
    }

    if (this.player.socket.readyState == 1) this.player.socket.send(data);
}

GameSession.prototype.handleMessage = function (login, role, message) {
    this.broadcast(JSON.stringify({
        type: 'message',
        sender: login,
        role,
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
                this.handleMessage(this.player.login, 'player', data.message);
            } break;
            case 'offer': {
                let { description, iceCandidates } = data;
                this.sendStreamInfoToWatcher(data.login, description, iceCandidates);
            } break;
            case 'task-confirmed': {
                this.taskConfirmed();
            } break;
            case 'task-rejected': {
                this.taskRejected();
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
                this.handleMessage(login, 'watcher', data.message);
            } break;
            case 'answer': {
                this.sendStreamInfoToPlayer(login, data.description);
            } break;
            case 'suggest-task': {
                this.taskSuggested(login, data.mission);
            } break;
            case 'confirm-done': {
                this.taskConfirmedDone(login);
            } break;
            case 'confirm-fail': {
                this.taskConfirmedFailed(login);
            } break;
            case 'task-info': {
                this.sendTaskInfo(login);
            } break;
        };
    });

    socket.on('close', (code, reason) => {
        if (reason == 'watcher disconnected')
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
};

GameSession.prototype.sendTaskInfo = async function (login) {
    if (this.status == statuses.WAITING_FOR_TASK) {
        this.watchers[login].send(JSON.stringify({
            type: 'task-info',
            status: this.status,
        }));
    } else {
        let task = await taskDB.getById(this.currentTask);

        this.watchers[login].send(JSON.stringify({
            type: 'task-info',
            status: this.status,
            creator: task.creator,
            mission: task.mission
        }));
    }
};

GameSession.prototype.taskSuggested = async function (login, mission) {
    if (this.status != statuses.WAITING_FOR_TASK) return;

    this.status = statuses.WAITING_FOR_CONFIRMING;
    this.currentTask = await taskDB.create(taskDB.TASK_STATUSES.ACTIVE, mission, login, this.player.login);

    await (await playerDB.getByLogin(this.player.login)).setActiveTask(this.currentTask);
    await (await watcherDB.getByLogin(login)).addCreatedTask(this.currentTask);

    this.broadcast(JSON.stringify({
        type: 'task-suggested',
        creator: login,
        mission
    }));
};

GameSession.prototype.taskConfirmed = async function () {
    if (this.status != statuses.WAITING_FOR_CONFIRMING) return;

    this.status = statuses.DOING_TASK;

    let task = await taskDB.getById(this.currentTask);

    this.broadcast(JSON.stringify({
        type: 'task-confirmed',
        creator: task.creator,
        mission: task.mission
    }))
};

GameSession.prototype.taskRejected = async function () {
    if (this.status != statuses.WAITING_FOR_CONFIRMING) return;

    let task = await taskDB.getById(this.currentTask);

    this.status = statuses.WAITING_FOR_TASK;
    this.currentTask = null;

    await (await playerDB.getByLogin(this.player.login)).taskDone(taskDB.TASK_STATUSES.REJECTED);

    this.broadcast(JSON.stringify({
        type: 'task-rejected',
        creator: task.creator,
        mission: task.mission
    }));
};

GameSession.prototype.taskConfirmedDone = async function (login) {
    if (this.status != statuses.DOING_TASK) return;

    let task = await taskDB.getById(this.currentTask);

    (await playerDB.getByLogin(this.player.login)).taskDone(taskDB.TASK_STATUSES.COMPLETED);

    this.status = statuses.WAITING_FOR_TASK;
    this.currentTask = null;

    this.broadcast(JSON.stringify({
        type: 'task-done',
        creator: task.creator,
        mission: task.mission,
        confirmedBy: login
    }));
};

GameSession.prototype.taskConfirmedFailed = async function (login) {
    if (this.status != statuses.DOING_TASK) return;

    let task = await taskDB.getById(this.currentTask);

    (await playerDB.getByLogin(this.player.login)).taskDone(taskDB.TASK_STATUSES.FAILED);
    this.status = statuses.WAITING_FOR_TASK;
    this.currentTask = null;

    this.broadcast(JSON.stringify({
        type: 'task-failed',
        creator: task.creator,
        mission: task.mission,
        confirmedBy: login
    }));
};

GameSession.prototype.closeSession = async function () {
    if (this.status == statuses.DOING_TASK) {
        (await playerDB.getByLogin(this.player.login)).taskDone(taskDB.TASK_STATUSES.FAILED);   
    }

    for (let watcher in this.watchers) {
        if (this.watchers[watcher].readyState == 1) this.watchers[watcher].close(1000, 'player disconnected');
        delete this.watchers[watcher];
    }
    this.deleteCallback();
};

module.exports = GameSession;