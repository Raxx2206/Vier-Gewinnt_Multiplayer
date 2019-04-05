var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

let playerCounter = 0;
let plSocket = Array();

io.on('connection', function (socket) {
    if(playerCounter >= 2) { return; }
    console.log('Player ' + playerCounter + ' connected');

    socket.emit('connected', playerCounter);

    socket.on('player moved', function (column) {
       socket.broadcast.emit('player moved', column);
       console.log('moved', column);
    });

    plSocket[playerCounter] = socket;
    playerCounter++;
});

http.listen(3000, function () {
    console.log('liston on :3000');
});