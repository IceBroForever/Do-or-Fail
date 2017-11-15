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

const watcherSchema = new Schema({
    login: String,
    password: String,
    favoritePlayers: Array,
    avatar: Schema.ObjectId
})

const Watcher = mongoose.model("Watcher", watcherSchema);

function create(login, password, avatar) {
    return avatarDB.create(avatar.name, avatar.data, avatar.mimetype)
        .then((avatarId) => {
            let watcher = new Watcher({
                login,
                password,
                avatar: avatarId,
                favoritePlayers: []
            })

            return watcher.save();
        })
}

function getAll() {
    return Watcher.find().exec();
}

function getById(id) {
    return Watcher.findById(id).exec();
}

function getByLogin(login) {
    return Watcher.findOne({ login }).exec();
}

function remove(id) {
    Watcher.findById(id).exec()
    .then((watcher) => {
        return avatarDB.removeAvatarById(watcher.avatar);
    })
    .then(() => {
        return Watcher.findByIdAndRemove(id);
    })
}

function update(id, updates) {
    return Watcher.findByIdAndUpdate(id, updates).exec();
}

module.exports = {
    create,
    getAll,
    getById,
    getByLogin,
    remove,
    update
};