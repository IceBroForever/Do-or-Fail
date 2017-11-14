const express = require("express"),
	bodyParser = require("body-parser"),
	busboy = require("busboy-body-parser"),
	cookieParser = require('cookie-parser'),
	crypto = require('crypto'),
	jsonwebtoken = require('jsonwebtoken'),
	jwt = require('express-jwt');

const app = express(),
	server = require('http').Server(app),
	io = require('socket.io')(server);

const serverSalt = "UWillNeverGuessThis";

const playersDB = require("./playersDB"),
	watchersDB = require("./watchersDB");

app.use(express.static("frontend/build"));
app.use(express.static("frontend/src"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(busboy());
app.use(cookieParser());

app.get('/', (req, res) => {
	res.sendFile("index.html");
});

app.post('/register', (req, res) => {
	const { login, password, role, avatar } = req.body;

	password = sha512(password, serverSalt).passwordHash;

	let promise = role == "player" ?
		playersDB.findOneByLogin(login) :
		watchersDB.findOneByLogin(login);

	promise.then((user) => {
		return res.json({
			error: "Login is used"
		})
	})
		.catch((error) => role == "player" ?
			playersDB.create(login, password, avatar) :
			watchersDB.create(login, password, avatar))
		.then(() => role == "player" ?
			playersDB.findOneByLogin(login) :
			watchersDB.findOneByLogin(login))
		.then((user) => {
			const token = jsonwebtoken({
				login,
				id: user._id
			})

			return res.json({
				login,
				role,
				id: user._id,
				token
			})
		});
});

app.post('/login', (req, res) => {
	const { login, password } = req.body;
	playersDB.findOneByLogin(login)
		.then((user) => {
			if (user.password !== sha512(password, serverSalt).passwordHash) return res.json({
				error: "Wrong password"
			});

			const token = jsonwebtoken.sign({
				login,
				id: user.id
			}, serverSalt);

			return res.json({
				login,
				role: "player",
				id: user._id,
				token
			})
		})
		.catch((error) => watchersDB.findByLogin(login))
		.then((watcher) => {
			if (watcher.password !== sha512(password, serverSalt).passwordHash) return res.json({
				error: "Wrong password"
			});

			const token = jsonwebtoken.sign({
				login,
				id: watcher.id
			}, serverSalt);

			return res.json({
				login,
				role: "player",
				id: watcher._id,
				token
			})
		})
		.catch((error) => res.json({
			error: "No such user"
		}));
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