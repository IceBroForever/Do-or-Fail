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

const playerSchema = new Schema({
    login: String,
    password: String,
    complitedTasks: Array,
    failedTasks: Array,
    rejectedTasks: Array,
    avatar: Schema.ObjectId,
    lastSeenOnline: Date
})

const Player = mongoose.model("Player", playerSchema);

module.exports = {}