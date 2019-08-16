//npm run build on reacttest folder
//Be sure to modify the ".env" file to fit your needs.
//Alternatively, you can add modify the .env on the command line when starting the server

const dotenv = require('dotenv');
const express = require('express');
const app = express();
const fs = require('fs');
var http = require('http');

dotenv.config();

var https = require('https');
var options = {
    key: fs.readFileSync(process.env.SSL_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT),
    ca: fs.readFileSync(process.env.SSL_CA)
    }
var server = https.createServer(options, app);
var serverUnsecure = http.createServer(app)

const io = require('socket.io')(server, {
  pingInterval: 5000,
  pingTimeout: 3000
});

const path = require('path');

var port = process.env.PORT_SECURE || 443;
var portUnsecure = process.env.PORT_UNSECURE || 80;
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
serverUnsecure.listen(portUnsecure);

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
     } else {
       socket.emit('peer', {initiator: false});
       socket.emit('joinInitiator', queue.pop());
       console.log("Users in queue: " + queue.length);
     }

  socket.on('initiatorData', function(data) {
    var socketid = socket.id;
    queue.push({socketid: socketid, data});
    console.log("Users in queue: " + queue.length);
 });

 socket.on("disconnect", function() {
   console.log("User disconnected");
   for(var i = 0; i < queue.length; i++) {
     if(typeof queue[i] != null || typeof queue[i] != 'undefined') {
          if(queue[i]["socketid"] == socket.id) {
            queue.splice(i, 1);
            console.log("User removed from queue");
            break;
          }

    }
   }
    
 });

 socket.on('backToInitiator', function(data) {
   var socketData = data;
   io.to(socketData.socketid).emit("toInitiatorFromServer", data);
 })
});
  console.log("Server is listening on port(s): " + port + ", " + portUnsecure);
