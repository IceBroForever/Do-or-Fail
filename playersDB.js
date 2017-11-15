require('dotenv').config();

const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_DB, {
    useMongoClient: true
})
    .then(() => console.log("Connected to DB"))
    .catch((error) => console.log(error));

const avatarDB = require("./avatarsDB");

const playerSchema = new Schema({
    login: String,
    password: String,
    complitedTasks: Array,
    failedTasks: Array,
    rejectedTasks: Array,
    avatar: Schema.ObjectId,
    lastSeenOnline: Date,
    position: Object
})

const Player = mongoose.model("Player", playerSchema);

function create(login, password, avatar) {
    return avatarDB.create(avatar.name, avatar.data, avatar.mimetype)
        .then((avatarId) => {
            let player = new Player({
                login,
                password,
                complitedTasks: [],
                failedTasks: [],
                rejectedTasks: [],
                avatar: avatarId,
                lastSeenOnline: new Date(),
                position: {
                    latitude: 0,
                    longitude: 0
                }
            })

            return player.save();
        })
}

function getAll() {
    return Player.find().exec();
}

function getById(id) {
    return Player.findById(id).exec();
}

function getByLogin(login) {
    return Player.findOne({ login }).exec();
}

function remove(id) {
    Player.findById(id).exec()
    .then((player) => {
        return avatarDB.removeAvatarById(player.avatar);
    })
    .then(() => {
        return Player.findByIdAndRemove(id);
    })
}

function update(id, updates) {
    return Player.findByIdAndUpdate(id, updates).exec();
}

module.exports = {
    create,
    getAll,
    getById,
    getByLogin,
    remove,
    update
};