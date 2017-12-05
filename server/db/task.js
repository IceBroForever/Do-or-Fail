const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '../.env')
})

const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_DB, {
    useMongoClient: true
})
    .then(() => console.log("Connected to DB"));

const TASK_STATUSES = {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REJECTED: 'REJECTED'
}

const taskSchema = new Schema({
    status: String,
    mission: String,
    creator: String,
    addressee: String,
    dateOfCreating: Date
});

const Task = mongoose.model('task', taskSchema);

async function create(status, mission, creator, addressee) {
    let dateOfCreating = new Date();

    let task = new Task({
        status,
        mission,
        creator,
        addressee,
        dateOfCreating
    });

    await task.save();
    return (await task.findOne({
        status,
        mission,
        creator,
        addressee,
        dateOfCreating
    }))._id;
}

async function getById(id) {
    return await Task.findById(id).exec();
}

async function removeById(id) {
    return await Task.findByIdAndRemove(id).exec();
}

async function updateStatusById(id, newStatus) {
    return await Task.findByIdAndUpdate(id, { status: newStatus }).exec();
}

module.exports = {
    TASK_STATUSES,
    create,
    getById,
    updateStatusById,
    removeById,
};