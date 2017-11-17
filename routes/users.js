const express = require('express'),
    router = express.Router(),
    jwt = require('express-jwt');

const playersDB = require('../playersDB'),
    watchersDB = require('../watchersDB');

const config = require('../config.json');

const playersRouter = require('./player'),
    watchersRouter = require('./wacther');

router.use(jwt({ secret: config.serverSecret }));

router.use('/player', checkPlayer, playersRouter);
router.use('/watcher', checkWatcher, watchersRouter);

router.get('/userInfo', (req, res) => {

    let { id, fields } = req.query;

    playersDB.getById(id)
    .then((user) => {
        if(!user) return watchersDB.getById(id)
        else return new Promise((resolve, reject) => resolve(user));
    })
    .then((user) => {
        if(!user) throw new Error("No such user");

        let userInfo = {};

        for(let field of fields){
            userInfo[field] = user[field];
        }

        userInfo['id'] = id;

        res.send(userInfo);
    })
    .catch((error) => {
        res.json({
            error: error.message
        });
    });
});

function checkPlayer(req, res, next) {
    if (req.user.role !== "player") return res.status(403).send({ error: "Forbidden" });
    next();
}

function checkWatcher(req, res, next) {
    if (req.user.role !== "watcher") return res.status(403).send({ error: "Forbidden" });
    next();
}

module.exports = router;