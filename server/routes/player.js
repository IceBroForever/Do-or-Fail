const express = require('express'),
    router = express.Router();

const playerDB = require('../db/player');

router.post('/:login/updatePosition', async (req, res, next) => {
    try {
        let player = req.user;
        if (player.login != req.params.login) throw new Error('Forbidden');

        let { latitude, longitude } = req.body;

        await player.setPosition(latitude, longitude);

        return res.json({
            message: 'ok'
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/:login', async (req, res, next) => {
    try {
        let player = await playerDB.getByLogin(req.params.login);

        return res.json(player.getInfoForSend());
    } catch (error) {
        return next(error);
    };
});

module.exports = router;