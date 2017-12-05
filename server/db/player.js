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
    lastSeenOnline: Date,
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

playerSchema.methods.changeLogin = async (newLogin) => {
    this.login = newLogin;
    return await this.save();
}

playerSchema.methods.changePassword = async (newPassword) => {
    this.password = newPassword;
    return await this.save();
}

playerSchema.methods.updatePosition = async (position) => {
    this.position = position;
    this.lastSeenOnline = new Date();
    return await this.save();
}

playerSchema.methods.setActiveTask = async (taskID) => {
    if (this.activeTask) throw new Error('Player has already active task');
    this.activeTask = taskID;
    return await this.save();
}

playerSchema.methods.taskDone = async (status) => {
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

const Player = mongoose.model("Player", playerSchema);

async function create(login, password, avatar) {

    if (await Player.findOne({ login })) throw new Error('Player is already exist');

    let player = new Player({
        login,
        password,
        avatar: await avatarsDB.create(avatar.name, avatar.data, avatar.mimetype),
        lastSeenOnline: new Date()
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
    removeById
}