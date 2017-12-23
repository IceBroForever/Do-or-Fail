const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '../.env')
})

const avatarsDB = require('./avatar'),
    taskDB = require('./task')

const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_DB, {
    useMongoClient: true
})
    .then(() => console.log("Connected to DB"));

const playerSchema = new Schema({
    login: String,
    password: String,
    activeTask: {
        type: Schema.ObjectId,
        default: null
    },
    complitedTasks: {
        type: [Schema.ObjectId],
        default: []
    },
    failedTasks: {
        type: [Schema.ObjectId],
        default: []
    },
    rejectedTasks: {
        type: [Schema.ObjectId],
        default: []
    },
    avatar: Schema.ObjectId,
    online: {
        type: Boolean,
        default: false
    },
    lastSeenOnline: {
        type: Date,
        default: null
    },
    position: {
        latitude: {
            type: Number,
            default: 0
        },
        longitude: {
            type: Number,
            default: 0
        }
    }
})

playerSchema.methods.changeLogin = async function (newLogin) {
    this.login = newLogin;
    return await this.save();
}

playerSchema.methods.changePassword = async function (newPassword) {
    this.password = newPassword;
    return await this.save();
}

playerSchema.methods.updatePosition = async function (position) {
    this.position = position;
    this.lastSeenOnline = new Date();
    return await this.save();
}

playerSchema.methods.setActiveTask = async function (taskID) {
    if (this.activeTask) throw new Error('Player has already active task');
    this.activeTask = taskID;
    return await this.save();
}

playerSchema.methods.taskDone = async function (status) {
    if (!this.activeTask) throw new Error('Player has no active task');

    let taskId = this.activeTask;

    switch (status) {
        case taskDB.TASK_STATUSES.COMPLETED: {
            this.complitedTasks.push(taskId);
        } break;
        case taskDB.TASK_STATUSES.FAILED: {
            this.failedTasks.push(taskId);
        } break;
        case taskDB.TASK_STATUSES.REJECTED: {
            this.rejectedTasks.push(taskId);
        } break;
        default: {
            throw new Error('Wrong task status');
        } break;
    }

    this.activeTask = null;
    await taskDB.updateStatusById(taskId, status);

    return await this.save();
}

playerSchema.methods.getCover = async function () {
    return await avatarsDB.getByIdForSend(this.avatar);
}

playerSchema.methods.setPosition = async function (latitude, longitude) {
    this.position = {
        latitude,
        longitude
    }
    this.lastSeenOnline = new Date();
    await this.save();
}

playerSchema.methods.getInfoForSend = function () {
    return {
        login: this.login,
        position: {
            latitude: this.position.latitude,
            longitude: this.position.longitude
        },
        isOnline: this.online,
        lastSeenOnline: this.lastSeenOnline
    };
}

playerSchema.methods.getFullInfoForSend = async function () {
    let activeTask = await taskDB.getById(this.activeTask);

    let complitedTasks = [];
    for(let task of this.complitedTasks){
        complitedTasks.push(await taskDB.getById(task));
    }

    let rejectedTasks = [];
    for(let task of this.rejectedTasks){
        rejectedTasks.push(await taskDB.getById(task));
    }

    let failedTasks = [];
    for(let task of this.failedTasks){
        failedTasks.push(await taskDB.getById(task));
    }

    return {
        login: this.login,
        position: {
            latitude: this.position.latitude,
            longitude: this.position.longitude
        },
        isOnline: this.online,
        lastSeenOnline: this.lastSeenOnline,
        activeTask,
        complitedTasks,
        rejectedTasks,
        failedTasks
    };
}

const Player = mongoose.model("Player", playerSchema);

async function create(login, password, avatar) {

    if (await Player.findOne({ login })) throw new Error('Player is already exist');

    let player = new Player({
        login,
        password,
        avatar: await avatarsDB.create(avatar.name, avatar.data, avatar.mimetype)
    })

    return await player.save();
}

async function getAll() {
    return await Player.find().exec();
}

async function getById(id) {
    return await Player.findById(id).exec();
}

async function getByLogin(login) {
    return await Player.findOne({ login }).exec();
}

async function getOnlinePlayers() {
    return await Player.find({ online: true }).exec();
}

async function findPlayersByLogin(login) {
    let players = await Player.find().exec();

    let finded = [];
    for(let player of players) {
        if(~player.login.toUpperCase().indexOf(login.toUpperCase())) finded.push(player);
    }
    return finded;
}

async function removeById(id) {
    let player = await Player.findById(id).exec();
    await avatarsDB.removeById(player.avatar);
    return await Player.findByIdAndRemove(id);
}

module.exports = {
    create,
    getAll,
    getById,
    getByLogin,
    getOnlinePlayers,
    findPlayersByLogin,
    removeById
}

setTimeout(async function check(timerId) {
    let players = await getAll();

    for(let player of players){
        if(new Date() - player.lastSeenOnline < 2000) {
            if(!player.online) {
                player.online = true;
                await player.save();
            }
        }
        else {
            if(player.online){
                player.online = false;
                await player.save();
            }
        }
    }

    setTimeout(check, 2000);
}, 2000);