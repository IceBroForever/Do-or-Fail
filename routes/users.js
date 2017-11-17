const express = require('express'),
    router = express.Router(),
    jwt = require('express-jwt');

const config = require('../config.json');

const playersRouter = require('./player'),
    watchersRouter = require('./wacther');

router.use(jwt({ secret: config.serverSecret }));

router.use('/player', checkPlayer, playersRouter);
router.use('/watcher', checkWatcher, watchersRouter);

function checkPlayer(req, res, next) {
    if (req.user.role !== "player") return res.status(403).send({ error: "Forbidden" });
    next();
}

function checkWatcher(req, res, next) {
    if (req.user.role !== "watcher") return res.status(403).send({ error: "Forbidden" });
    next();
}

module.exports = router;