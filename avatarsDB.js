const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/Kursach", {
    useMongoClient: true
})
    .then(() => console.log("Connected to DB"))
    .catch((error) => console.log(error));

const avatarSchema = new Schema({
    name: String,
    buffer: Buffer,
    contentType: String
});

const Avatar = mongoose.model("Avatar", avatarSchema);

function create(name, buffer, contentType) {
    return new Promise((resolve, reject) => {
        let avatar = new Avatar({
            name,
            buffer,
            contentType
        })

        return avatar.save()
            .then(() => {
                return Avatar.find({ buffer }).exec();
            })
            .then((avatar) => {
                resolve(avatar._id);
            })
    });
}

function getAvatarById(id) {
    return Avatar.findById(id).exec();
}

function removeAvatarById(id) {
    return Avatar.findByIdAndRemove(id).exec();
}


module.exports = {
    create,
    getAvatarById,
    removeAvatarById,
};