require('dotenv').config();

const express = require("express"),
	bodyParser = require("body-parser"),
	busboy = require("busboy-body-parser"),
	cookieParser = require('cookie-parser'),
	crypto = require('crypto'),
	jsonwebtoken = require('jsonwebtoken'),
	path = require('path'),
	config = require('./config.json');

const app = express();

const playersDB = require("./playersDB"),
	watchersDB = require("./watchersDB");

const userRouter = require('./routes/users');

app.use(express.static(path.join(process.env.PWD, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(busboy({ limit: '5mb' }));
app.use(cookieParser());

app.get('*', (req, res) => {
	res.sendFile(path.join(process.env.PWD, 'public/index.html'));
});

app.post('/login', (req, res) => {

	let { login, password, role } = req.body;
	password = sha512(password, config.serverSalt).passwordHash;

	let userDB = role == "player" ? playersDB : watchersDB;

	userDB.getByLogin(login)
		.then((user) => {
			if (!user) throw new Error("No such user");

			if (user.password !== password) throw new Error("Wrong password");

			const token = jsonwebtoken.sign({
				id: user._id,
				role
			}, config.serverSecret, { expiresIn: (30 * 24) + 'h' });

			res.json({
				login,
				id: user._id,
				role,
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

	password = sha512(password, config.serverSalt).passwordHash;

	let userDB = role == "player" ? playersDB : watchersDB;

	userDB.getByLogin(login)
		.then((user) => {
			if (user) throw new Error("Login is already used");
			else return userDB.create(login, password, avatar)
				.then(() => userDB.getByLogin(login))
				.then((user) => {
					const token = jsonwebtoken.sign({
						id: user._id,
						role
					}, config.serverSecret, { expiresIn: (30 * 24) + 'h' });

					res.json({
						login,
						id: user._id,
						role,
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

app.listen(process.env.PORT, () => console.log("ready"));

function sha512(password, salt) {
	const hash = crypto.createHmac('sha512', salt);
	hash.update(password);
	const value = hash.digest('hex');
	return {
		salt: salt,
		passwordHash: value
	};
};