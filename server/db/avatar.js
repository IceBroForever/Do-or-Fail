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

const avatarSchema = new Schema({
    name: String,
    buffer: Buffer,
    contentType: String
});

const Avatar = mongoose.model("Avatar", avatarSchema);

async function create(name, buffer, contentType) {
    let avatar = new Avatar({
        name,
        buffer,
        contentType
    });

    await avatar.save();
    return (await Avatar.findOne({ name, buffer, contentType }))._id;
}

async function getById(id) {
    return await Avatar.findById(id).exec();
}

async function removeById(id) {
    return await Avatar.findByIdAndRemove(id).exec();
}

async function getByIdForSend(id){
    let avatars = await Avatar.find();

    let avatar = await Avatar.findById(id).exec();
    return avatar.buffer;
}

module.exports = {
    create,
    getById,
    removeById,
    getByIdForSend
};