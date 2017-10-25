const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const busboy = require("busboy-body-parser");

let app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(busboy({ limit: '5mb' }));

app.get('/', (req, res) => {
	res.render('index');
});

app.listen(4000, () => console.log("ready"));