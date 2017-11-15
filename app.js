require('dotenv').config();

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

const serverSalt = "UWillNeverGuessThis",
	serverSecret = "ItsTheFifthSleeplessNight";

const playersDB = require("./playersDB"),
	watchersDB = require("./watchersDB");

app.use(express.static("frontend/build"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(busboy({ limit: '5mb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
	res.sendFile("/index.html");
});

app.post('/login', (req, res) => {
	let { login, password, role } = req.body;
	password = sha512(password, serverSalt).passwordHash;

	let userDB = role == "player" ? playersDB : watchersDB;

	userDB.getByLogin(login)
	.then((user) => {
		if(!user) throw new Error("No such user");

		if(user.password !== password) throw new Error("Wrong password");

		const token = jsonwebtoken.sign({
			login,
			id: user._id
		}, serverSecret);

		res.json({
			login,
			id: user._id,
			token
		})
	})
	.catch((error) => {
		res.json({
			error: error.message
		})
	})
});

app.post('/register', (req, res) => {
	let { login, password, role } = req.body;
	let { avatar } = req.files;

	password = sha512(password, serverSalt).passwordHash;

	let userDB = role == "player" ? playersDB : watchersDB;

	userDB.getByLogin(login)
		.then((user) => {
			if (user) return new Promise((resolve, reject) => reject(new Error("Login is already used")));
			else return userDB.create(login, password, avatar)
				.then(() => userDB.getByLogin(login))
				.then((user) => {
					const token = jsonwebtoken.sign({
						login,
						id: user._id
					}, serverSecret)

					console.log({
						login,
						id: user._id,
						token
					});

					res.json({
						login,
						id: user._id,
						token
					})
				})
		})
		.catch((error) => {
			console.log(error);
			res.json({
				error: error.message
			})
		})
})

server.listen(process.env.PORT, () => console.log("ready"));

function sha512(password, salt) {
	const hash = crypto.createHmac('sha512', salt);
	hash.update(password);
	const value = hash.digest('hex');
	return {
		salt: salt,
		passwordHash: value
	};
};