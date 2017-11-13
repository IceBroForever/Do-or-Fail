var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var path = require("path");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// view engine setup
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render("index");
});

app.get('/1', (req, res) => {
    res.render("index1");
});

var streamer = io.of('/streamer');

var watchers = [];
var id = 0;

streamer.on("connection", (socket) => {
    console.log("new streamer");

    socket.on("offer", (data) => {
        let s = watchers.find((e) => e.id == data.id);
        s.emit("offer", data.desc);
    });

    socket.on("ice", (data) => {
        s = watchers.find((e) => e.id == data.id);
        watcher.emit("ice", data.candidate);
    })
})

var watcher = io.of("/watcher", (socket) => {
    console.log("new watcher");

    socket.id = id++;
    watchers.push(socket)

    socket.emit("id", socket.id);
    
    socket.on("askForOffer", (id) => {
        streamer.emit("createOffer", id);
    });

    socket.on("answer", (data) => {
        streamer.emit("answer", data);
    });
    
    socket.on("ice", (data) => {
        streamer.emit("ice", data);
    })
});

server.listen(4000, () => console.log("ready"));