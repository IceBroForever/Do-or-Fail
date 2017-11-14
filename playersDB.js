const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/Kursach", {
    useMongoClient: true
})
    .then(() => console.log("Connected to DB"))
    .catch((error) => console.log(error));

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

async function create(login, password, avatar) {
    let player = new Player({
        login,
        password,
        complitedTasks: [],
        failedTasks: [],
        rejectedTasks: [],
        avatar,
        lastSeenOnline: new Date(),
        position: {
            latitute: 0,
            longitute: 0
        }
    });

    return player.save();
}

async function getAll() {
    return Player.find();
}

async function getById(id) {
    return Player.findById(id);
}

async function remove(id) {
    return Player.findByIdAndRemove(id);
}

async function findOneByLogin(login) {
    return Player.findOne({ login });
}

async function findByLogin(login){
    return Player.find()
    .then((players) => {
        return new Promise((resolve, reject) => {
            let matched = [];

            for(let player of players) {
                if(~player.login.indexOf(login)) matched.push(player);
            }

            resolve(mathed);
        });
    });
}

async function update(id, changes) {
    return Player.findByIdAndUpdate(id, changes);
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