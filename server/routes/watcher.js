const express = require('express'),
    router = express.Router();

const playerDB = require('../db/player');

router.get('/getPlayersOnline', async (req, res, next) => {
    let players = await playerDB.getOnlinePlayers();
    let dataForResponce = [];

    for (let player of players) {
        dataForResponce.push({
            login: player.login,
            position: player.position
        })
    }

    return res.json({ players: dataForResponce });
});

module.exports = router;