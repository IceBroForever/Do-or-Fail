const express = require('express'),
    router = express.Router();

const playerDB = require('../db/player');

router.get('/getPlayersOnline', async (req, res, next) => {
    let players = await playerDB.getOnlinePlayers();

    players = players.map(player => player.getInfoForSend());

    return res.json({ players });
});

router.get('/find', async (req, res, next) => {
    let players = await playerDB.findPlayersByLogin(req.query.login);

    players = players.map(player => { return player.getInfoForSend(); });

    return res.json({ players });
});

module.exports = router;