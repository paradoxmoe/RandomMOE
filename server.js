//npm run build on reacttest folder

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require('express');
const app = express();
const fs = require('fs');
var https = require('https');
var http = require('http');

var options = {
    key: fs.readFileSync('/home/ubuntu/certs/sslforfree/private.key'),
    cert: fs.readFileSync('/home/ubuntu/certs/sslforfree/certificate.crt'),
    ca: fs.readFileSync('/home/ubuntu/certs/sslforfree/ca_bundle.crt')
    }


var server = https.createServer(options, app);
var serverUnsecure = http.createServer(app)

const io = require('socket.io')(server, {
  pingInterval: 5000,
  pingTimeout: 3000
});
const path = require('path');

var port = process.env.PORT || 8080;

var queue = [];

app.use(function (req, res, next) {
  if(req.secure || req.header('x-forwarded-proto') == 'https') {
    next()
  } else {
    res.redirect("https://" + req.headers.host + req.url );
  }
})

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

/*
app.get('/.well-known/acme-challenge/:file', function(req, res) {

   res.sendFile(__dirname + '/.well-known/acme-challenge/' + req.params.file);
})

*/

server.listen(port);
serverUnsecure.listen(80);

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

 socket.on("disconnect", function() {
    if(typeof queue[socket.id] != null || typeof queue[socket.id] != 'undefined') {
      delete queue[socket.id];
    }
 });

 socket.on('backToInitiator', function(data) {
   var socketData = data;
   io.to(socketData.socketid).emit("toInitiatorFromServer", data);
 })
});

console.log("Server is listening on port: " + port + ", 80");
