const express = require('express'),
    router = express.Router();

const playersDB = require("../playersDB");

router.post('/updatePos', (req, res) => {

    let { latitude, longitude } = req.query;

    playersDB.update(req.user.id, { position: { latitude, longitude }, lastSeenOnline: new Date() })
        .then((data) => {
            if (!data) res.status(404).send({ error: "No such user" });
            else res.status(200).send({ message: "Updated" });
        });
})

module.exports = router;