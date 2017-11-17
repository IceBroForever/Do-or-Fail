const express = require('express'),
    router = express.Router();

const playerDB = require('../playersDB');

router.get('/getOnlinePlayers', (req, res) => {
    playerDB.getAll()
        .then((players) => {
            players = players.filter((player) => {
                return (new Date() - player.lastSeenOnline) / 1000 / 60 < 1.0;
            });

            players = players.map((player) => player.id);

            res.status(200).send({ players });
        })
});

module.exports = router;