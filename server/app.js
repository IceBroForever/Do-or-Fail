const express = require('express'),
    app = express(),
    path = require('path'),
    passport = require('passport'),
    BearerStrategy = require('passport-http-bearer'),
    bodyParser = require('body-parser'),
    busboy = require('busboy-body-parser'),
    crypto = require('crypto'),
    jwt = require('jsonwebtoken');

const playerDB = require('./db/player'),
    watcherDB = require('./db/watcher');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(busboy());
app.use(passport.initialize());

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT || 4000);