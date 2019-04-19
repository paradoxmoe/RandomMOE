//npm run build on reacttest folder

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require('express');
const app = express();
const fs = require('fs');
//var https = require('https');
var http = require('http');
//const server = require('http').createServer(app);

/*
var options = {
    key: fs.readFileSync('./invalidCerts/96461604_192.168.1.43.key'),
    cert: fs.readFileSync('./invalidCerts/96461604_192.168.1.43.cert'),
    rejectUnauthorized: false,
    requestCert: false

    }
*/

var server = http.createServer(app);
//var serverUnsecure = http.createServer(app)

const io = require('socket.io')(server);
const path = require('path');

var port = process.env.PORT || 5000;

var queue = [];

app.use(function (req, res, next) {
  if(req.secure) {
    next()
  } else {
    res.redirect("https://" + req.headers.host + ":80" + req.url );
  }
})

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


/*
function redirectSec(req, res, next) {
  if (!req.secure) {
      res.redirect('https://' + req.headers.host + req.path);
  } else {
      return next();
  }
}
*/

server.listen(port);
//serverUnsecure.listen(80);

io.on('connection', (socket) => {
  console.log("User Connected");
  //socket.interest = socket.interest.toLowerCase();
  /*
    if(typeof queue[socket.interest] != 'undefined') {
      if(queue[socket.interest]) {
        //Client's interest exist

        if(queue[socket.interest].length > 0) {
          //Another client with similar interest is already in the queue, needs to be matched

        } else {
          //Client is added to queue, must be the simple-peer initiator
          if(!socket.currentlySearching) {
            queue[socket.interest].push(socket);
            socket.emit('becomeInitiator');
            socket.currentlySearching = true;
          }
        }
      }
    }
    */

    if(queue.length <= 0) {
      socket.emit('peer', {initiator: true});
      console.log("Client told to become initiator");
      console.log("Users in queue: " + queue.length);
     } else {
       socket.emit('peer', {initiator: false});
       socket.emit('joinInitiator', queue.pop());
       console.log("Users in queue: " + queue.length);
     }

  socket.on('initiatorData', function(data) {
    var socketid = socket.id;
    queue.push({socketid: socketid, data});
    
 });

 socket.on('backToInitiator', function(data) {
   var socketData = data;
   io.to(socketData.socketid).emit("toInitiatorFromServer", data);
 })
});

console.log("Server is listening on port: " + port);
