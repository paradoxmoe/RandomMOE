//npm run build

import React, { Component } from 'react';
import Chat from './components/Chat';
import CreateMessage from './components/CreateMessage';
import CanvasBackground from './components/CanvasBackground';
import * as openpgp from 'openpgp';
import './App.css';
import Peer from 'simple-peer'; 
import socketIOClient from 'socket.io-client';
import $ from 'jquery';


openpgp.initWorker({path: './dist/openpgp.worker.min.js'}); 

if(typeof localStorage.publicKey == 'undefined' || typeof localStorage.privateKey == 'undefined' || typeof localStorage.pass == 'undefined') {

  var cryptoArray = new Uint32Array(4);
  window.crypto.getRandomValues(cryptoArray);
  localStorage.pass = cryptoArray[2].toString()
  var options = {
    userIds: [{name: cryptoArray[3].toString(), email: cryptoArray[0] + '@' + cryptoArray[1] + '.com' }],
    numBits: 2048,
    passphrase: localStorage.pass
  }

  openpgp.generateKey(options).then(function(key) {
  localStorage.setItem('privateKey', key.privateKeyArmored);
  localStorage.setItem('publicKey', key.publicKeyArmored);

  })
}

class App extends Component {
  

  constructor(props) {
    super(props);
    this.state = {
      chatMessages: [ 
      ],
      peerInfo: null,
      stream: null,
      peer: null,
      peerStream: null
    }
    
  }

  componentDidMount() {

    navigator.mediaDevices.getUserMedia({video:true, audio: true}).then(stream => {
      this.clientRef.srcObject = stream;
      this.clientRef.onloaddedmetadata = this.clientRef.play();
      this.forceUpdate();
      this.socketConnection(stream);

    })
  }

  socketConnection(stream) {
    var socket = socketIOClient.connect("https://vaporwaveom.herokuapp.com/");
    console.log("Connecting to server...");

    socket.on('peer', (data) => {
      this.createPeer(data.initiator, stream);
      
      console.log("Server told client to become initiator: " + data.initiator);
      if(data.initiator) {
        this.state.peer.on("signal", (data) => {
          socket.emit("initiatorData", data);
          console.log("Emitting Initiator data to Server...");
        })
      }
    });

      socket.on('joinInitiator', (data) => {
        console.log("Joinining the initiator...");
        console.log(data.data);
        this.state.peer.signal(data.data);
        
        if(!data.initiator) {
          var initiaitorSocketId = data.socketid;
          this.state.peer.on('signal', (data) => {
            socket.emit("backToInitiator", {socketid: initiaitorSocketId, data: data});
            console.log("Recieving Initiator's Data..");
          })
        }
      })

      socket.on('toInitiatorFromServer', (data) => {
        this.state.peer.signal(data.data);

        console.log("Connecting to Peer...");
      })
    
  }

  submitButton = () => {
    console.log("Can Submit")
  }

  //Needs to be finished
  createPeer = (initiator, stream) => {
  var peer = new Peer({initiator: initiator, trickle: false, stream: stream});

  this.forceUpdate();
  
    peer.on("connect", () => {
        peer.send(JSON.stringify({isPublicKey: true, peerPublicKey: localStorage.publicKey}))
        console.log("Sent Public Key!");
    })

    peer.on("data", (data) => {
      data = JSON.parse(data);

      if(data.isPublicKey == true) {
        this.setState({peerPublicKey: data.peerPublicKey});
        console.log("Public Key Recieved!");
      } else {

        let privKey = openpgp.key.readArmored(localStorage.privateKey).keys[0];
        privKey.decrypt(localStorage.pass);

        let options = {
          message: data.message,
          privateKey: privKey
        }

        openpgp.decrypt(options).then( (plaintext) => {
          let newMessage = {
            id: this.state.chatMessages.length,
            user: data.user,
            message: plaintext 
          }
          this.setState({chatMessages: [...this.state.chatMessages, newMessage]});
        })


      }


    });

    peer.on("stream", (data) => {
      this.setState({peerStream: data});
      this.peerRef.srcObject = this.state.peerStream;
      this.peerRef.onloaddedmetadata = this.peerRef.play();
    });

    this.setState({peer: peer});
    return peer;
  }


  createMessage = (user, content) => {

      const newMessage = {
        id: this.state.chatMessages.length,
        user: user,
        message: content 
      }
      this.setState({chatMessages: [...this.state.chatMessages, newMessage]});

      let options = {
        message: content,
        publicKeys: openpgp.key.readArmored(this.state.peerPublicKey).keys,
      }

      openpgp.encrypt(options).then( (ciphertext) => {
        this.state.peer.send(JSON.stringify({user: 'Anon', message: ciphertext.content}));
      });

      
     
  }



  render() {
    return (
      <div className="App">
      
      <div id = "videoChat">
        <h3 id = "logo">パラドックス <a href="https://twitter.com/Twitch_NotDem">Twitter</a> | <a href="https://twitch.tv/notdem">Twitch</a> | <a href="https://github.com/verysimplyms/omreact">Github Repo</a></h3>
        <video ref = {clientRef => {this.clientRef = clientRef}} controls muted></video>
        <video ref = {peerRef => {this.peerRef = peerRef}} controls></video>
      </div>
        <div id = "chatApp" class = "disableScrollbars">
          <Chat chatMessages = {this.state.chatMessages} submit = {this.submitButton} />
        </div>
        
        <CreateMessage createMessage =  {this.createMessage} peer = {this.peer} />
        <CanvasBackground />
      </div>
    );
  }
}

export default App;
