//npm run build on reacttest folder
//Be sure to modify the ".env" file to fit your needs.
//Alternatively, you can add modify the .env on the command line when starting the server

const dotenv = require('dotenv');
const express = require('express');
const app = express();
const fs = require('fs');
var http = require('http');
var ioClient = require('socket.io-client');


dotenv.config();
var whiteListedServers = process.env.WHITELISTED_SERVERS.split(' ')

/*
if(process.env.NODE_ENV === 'aws') {
var https = require('https');
var options = {
    key: fs.readFileSync(process.env.SSL_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT),
    ca: fs.readFileSync(process.env.SSL_CA)
    }
var server = https.createServer(options, app);
  }
*/

var serverUnsecure = http.createServer(app)

const io = require('socket.io')(serverUnsecure, {
  pingInterval: 5000,
  pingTimeout: 3000
});

const path = require('path');

var port = process.env.PORT_SECURE || 443;
var portUnsecure = process.env.PORT_UNSECURE || 80;
var queue = [];

//if(process.env.NODE_ENV === 'aws') {
  app.use(function (req, res, next) {
    if(req.secure || req.header('x-forwarded-proto') == 'https') {
      next()
    } else {
      res.redirect("https://" + req.headers.host + req.url );
    }
  })
//}



app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

/*
app.get('/.well-known/acme-challenge/:file', function(req, res) {

   res.sendFile(__dirname + '/.well-known/acme-challenge/' + req.params.file);
})

*/
/*
if(process.env.NODE_ENV === 'aws') {
  server.listen(port);
}
*/
serverUnsecure.listen(portUnsecure);

io.on('connection', (socket) => {
  console.log("User Connected");
  var min = 0
  socket.currentServer = Math.floor(Math.random() * (whiteListedServers.length - 0)) + 0;

  socket.searchOtherServers = setTimeout( () => {


    ioClient.connect(whiteListedServers[0]);
    console.log("Connecting to server: " + whiteListedServers[0])
  }, 5000)

    if(typeof ioClient.on != null && typeof ioClient.on != 'undefined') {
      ioClient.on('peer', function (data) {
        if(data.initiator) {
          ioClient.disconnect()
        } else {
          socket.emit('peer', {initiator:false})
        } 
      })
      
      ioClient.on('joinInitiator', function(data) {
        socket.emit('joinInitiator', data);
      })
    }
    

    if(queue.length <= 0) {
      socket.emit('peer', {initiator: true});
      console.log("Client told to become initiator");
      
     } else {
       socket.emit('peer', {initiator: false});
       socket.emit('joinInitiator', queue.pop());
       console.log("Users in queue: " + queue.length);
       if(typeof socket.searchOtherServers == null || typeof socket.searchOtherServers == 'undefined') {
         clearTimeOut(socket.searchOtherServers);
       }
       
     }

  socket.on('initiatorData', function(data) {
    var socketid = socket.id;
    queue.push({socketid: socketid});

    console.log("Users in queue: " + queue.length);
 });

 socket.on("disconnect", function() {
   console.log("User disconnected");
   for(var i = 0; i < queue.length; i++) {
     if(typeof queue[i] != null || typeof queue[i] != 'undefined') {
          if(queue[i]["socketid"] == socket.id) {
            queue.splice(i, 1);
            console.log("User removed from queue");
            if(typeof socket.searchOtherServers == null || typeof socket.searchOtherServers == 'undefined') {
              clearTimeOut(socket.searchOtherServers);
            }
            break;
          }

    }
   }
    
 });

 socket.on('backToInitiator', function(data) {
   var socketData = data;
   if(typeof socketData.socketid != null || typeof socketData.socketid != 'undefined' ) {
     io.to(socketData.socketid).emit("toInitiatorFromServer", data);
   } else if(ioClient.connected == true) {
      ioClient.emit('backToInitiator', socketData);
      if(typeof socket.searchOtherServers == null || typeof socket.searchOtherServers == 'undefined') {
        clearTimeOut(socket.searchOtherServers);
      }
   }
   
 })
});

//if(process.env.NODE_ENV === 'aws') {
//  console.log("Server is listening on port(s): " + port + ", " + portUnsecure);
//} else {
  console.log("Server is listening on port: " + portUnsecure);
//}
