require('dotenv').config();

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

passport.use(new BearerStrategy(async (token, done) => {
    jwt.verify(token, process.env.SERVER_SECRET, async (error, decoded, info) => {
        if(error) return done(error);

        let { login, role } = decoded;
        useDB = role == 'player' ? playerDB : watcherDB;
        try {
            let user = await userDB.getByLogin(login);
            return done(null, user);
        } catch (error) {
            return done(error)
        }
    });
}));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/register', async (req, res, next) => {
    let { login, password, role } = req.body;
    let avatar = req.files.avatar;

    let userDB = role === 'player' ? playerDB : watcherDB;

    try {
        await userDB.create(login, sha512(password), avatar);

        return res.json({
            message: 'ok'
        });

    } catch (error) {
        return next(error);
    }
});

app.post('/login', async (req, res, next) => {
    let { login, password, role } = req.body;

    let userDB = role === 'player' ? playerDB : userDB;

    try {
        let user = await userDB.getByLogin(login);
        if (!user) throw new Error('No such user');

        if (user.password != sha512(password)) throw new Error('Wrong password');

        const token = jwt.sign({
            login,
            role
        }, process.env.SERVER_SECRET);

        return res.json({
            login,
            role,
            token
        });
    } catch (error) {
        return next(error);
    }
});

app.post('/verify', async (req, res, next) => {
    passport.authenticate('bearer', {session: false}, (error, user, unfo) => {
        if(error) return next(error);

        return res.json({
            login: user.login,
            role: user.role
        })
    })(req, res, next);
})

app.use((error, req, res, next) => {
    return res.status(500).json({
        error: error.message
    });
})

app.listen(process.env.PORT || 4000);

function sha512(password) {
    const hash = crypto.createHmac('sha512', process.env.SERVER_SALT);
    hash.update(password);
    return hash.digest('hex');
};