const express = require("express"),
	bodyParser = require("body-parser"),
	busboy = require("busboy-body-parser"),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	crypto = require('crypto'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

const app = express(),
	server = require('http').Server(app),
	io = require('socket.io')(server);

const serverSalt = "UWillNeverGuessThis";

const playersDB = require("./playersDB"),
	watchersDB = require("./watchersDB");

app.use(express.static("frontend/build"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(busboy());
app.use(cookieParser());
app.use(session({
	secret: 'Does anybody see this?',
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
	done(null, user._id);
});

passport.deserializeUser(function (id, done) {
	playersDB.getById(id)
		.then((player) => done(null, player))
		.catch((error) => watchersDB.getById(id))
		.then((watcher) => done(null, watcher))
		.catch((error) => done(new Error("No such user"), false));
});

passport.use(new LocalStrategy(
	function (login, password, done) {
		playersDB.findOneByLogin(login)
			.then((player) => {
				if (player.password === sha512(password, salt).passwordHash) return done(null, player);
				return done("Wrong password", false);
			})
			.catch((error) => watchersDB.findOneByLogin(login))
			.then((watcher) => {
				if (watcher.password === sha512(password, salt).passwordHash) return done(null, watcher);
				return done("Wrong password", false);
			})
			.catch((error) => done("No such user", false));
	}
));

app.get('/', (req, res) => {
	res.sendFile("index.html");
});

server.listen("4000", () => console.log("ready"));

function sha512(password, salt) {
	const hash = crypto.createHmac('sha512', salt);
	hash.update(password);
	const value = hash.digest('hex');
	return {
		salt: salt,
		passwordHash: value
	};
};