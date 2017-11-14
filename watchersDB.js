const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/Kursach", {
    useMongoClient: true
})
    .then(() => console.log("Connected to DB"))
    .catch((error) => console.log(error));

const watcherSchema = new Schema({
    login: String,
    password: String,
    favoritePlayers: Array,
    avatar: Schema.ObjectId
})

const Watcher = mongoose.model("Watcher", watcherSchema);

async function create(login, password, avatar){
    let watcher = new Watcher({
        login,
        password,
        avatar
    });

    return watcher.save();
}

async function getAll() {
    return Watcher.find();
}

async function getById(id){
    return Watcher.findById(id);
}

async function remove(id){
    return Watcher.findByIdAndRemove(id);
}

async function findOneByLogin(login) {
    return Watcher.findOne({ login });
}

async function findByLogin(login){
    return Watcher.find()
    .then((watchers) => {
        return new Promise((resolve, reject) => {
            let matched = [];

            for(let watcher of watchers) {
                if(~watcher.login.indexOf(login)) matched.push(watcher);
            }

            resolve(mathed);
        });
    });
}

async function update(id, changes){
    return Watcher.findByIdAndUpdate(id, changes);
}

module.exports = {
    create,
    getAll,
    getById,
    remove,
    findOneByLogin,
    findByLogin,
    update
};