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

passport.serializeUser(function(user, done) {
    //TODO
});

passport.deserializeUser(function(id, done) {
	//TODO
});

passport.use(new LocalStrategy(
	function(login, password, done) {
		//TODO
	}
));

app.get('/', (req, res) => {
	res.sendFile("index.html");
});

server.listen("4000", () => console.log("ready"));