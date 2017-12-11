const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '../.env')
})

const avatarsDB = require('./avatar');

const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_DB, {
    useMongoClient: true
})
    .then(() => console.log("Connected to DB"));

const watcherSchema = new Schema({
    login: String,
    password: String,
    favoritePlayers: {
        type: [Schema.ObjectId],
        default: []
    },
    createdTasks: {
        type: [Schema.ObjectId],
        default: []
    },
    avatar: Schema.ObjectId,
    position: {
        latitude: {
            type: Number,
            default: 0
        },
        longitude: {
            type: Number,
            default: 0
        }
    },
    lastSeenOnline: Date,
});

watcherSchema.methods.changeLogin = async function (newLogin) {
    this.login = newLogin;
    return await this.save();
}

watcherSchema.methods.changePassword = async function (newPassword) {
    this.password = newPassword;
    return await this.save();
}

watcherSchema.methods.updatePosition = async function (position) {
    this.position = position;
    this.lastSeenOnline = new Date();
    return await this.save();
}

watcherSchema.methods.addFavoritePlayer = async function (playerId) {
    this.favoritePlayers.push(playerId);
    return await this.save();
}

watcherSchema.methods.removeFavoritePlayer = async function (playerId) {
    let index = this.favoritePlayers.indexOf(playerId);
    if(~index) throw new Error('User is not favorite');
    this.favoritePlayers.splice(index, 1);
    return await this.save();
}

watcherSchema.methods.addCreatedTask = async function (taskId) {
    this.createdTasks.push(taskId);
    return await this.save();
}

watcherSchema.methods.getCover = async function () {
    return await avatarsDB.getByIdForSend(this.avatar);
}

const Watcher = mongoose.model('Watcher', watcherSchema);

async function create(login, password, avatar) {
    if(await Watcher.findOne({login}).exec()) throw new Error('Watcher is already exist');

    let watcher = new Watcher({
        login,
        password,
        avatar: await avatarsDB.create(avatar.name, avatar.data, avatar.mimetype)
    });

    return await watcher.save();
}

async function getAll() {
    return await Watcher.find().exec();
}

async function getById(id) {
    return await Watcher.findById(id).exec();
}

async function getByLogin(login) {
    return await Watcher.findOne({ login }).exec();
}

async function removeById(id) {
    let watcher = await Watcher.findById(id).exec();
    await avatarsDB.removeById(watcher.avatar);
    return await Watcher.findByIdAndRemove(id);
}

module.exports = {
    create,
    getAll,
    getById,
    getByLogin,
    removeById
}