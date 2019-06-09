//npm run build

import React, { Component } from 'react';
import Chat from './components/Chat';
import SiteIntro from './components/SiteIntro';
import CreateMessage from './components/CreateMessage';
import CanvasBackground from './components/CanvasBackground';
import * as openpgp from 'openpgp';
import './App.css';
import Peer from 'simple-peer'; 
import socketIOClient from 'socket.io-client';
//import data from 'emoji-mart/data/messenger.json'
//import { NimblePicker } from 'emoji-mart'
//import $ from 'jquery';


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
      inConvo: false,
    }
    
  }

  componentDidMount() {
    navigator.mediaDevices.getUserMedia({video:true, audio: true}).then(stream => {
      this.clientRef.srcObject = stream;
      this.clientRef.onloaddedmetadata = this.clientRef.play();
      this.forceUpdate();
    }).catch((err) => {
      this.clientRef.srcObject = false;
      this.forceUpdate();
    })
  }

  componentDidCatch(err, info) {
    console.log(err);
    console.log(info);
  }

  socketConnection = (stream) => {
    var socket = socketIOClient.connect("https://random.moe");   
    this.setState({chatMessages: [...this.state.chatMessages, {id: this.state.chatMessages.length, user: "Client", message:"Connecting to Server..."}]})
    socket.on('peer', (data) => {
      this.createPeer(data.initiator, stream);
      
      console.log("Server told client to become initiator: " + data.initiator);
      if(data.initiator) {
        this.state.peer.on("signal", (data) => {
          socket.emit("initiatorData", data);
          this.setState({chatMessages: [...this.state.chatMessages, {id: this.state.chatMessages.length, user: "Client", message:"Emitting Initiator data to Server..."}]})
        })
      }
    });

      socket.on('joinInitiator', (data) => {
        this.setState({chatMessages: [...this.state.chatMessages, {id: this.state.chatMessages.length, user: "Client", message:"Joining Initiator..."}]})
        this.state.peer.signal(data.data);
 

        if(!data.initiator) {
          var initiaitorSocketId = data.socketid;
          this.state.peer.on('signal', (data) => {
            socket.emit("backToInitiator", {socketid: initiaitorSocketId, data: data});
            this.setState({chatMessages: [...this.state.chatMessages, {id: this.state.chatMessages.length, user: "Client", message:"Recieving Initiator's Data..."}]})
          })
        }
      })

      socket.on('toInitiatorFromServer', (data) => {
       
          this.state.peer.signal(data.data);  
          this.setState({chatMessages: [...this.state.chatMessages, {id: this.state.chatMessages.length, user: "Client", message:"Connecting to Peer..."}]})
      })
  }

  submitButton = () => {
    console.log("Can Submit")
  }

  next = () => {
    this.setState({chatMessages: [...this.state.chatMessages, {id: this.state.chatMessages.length, user: "Client", message:"Finding User..."}]})
    if(this.state.peer != null && typeof this.state.peer != 'undefined') {
        this.state.peer.destroy();
        this.setState({
          chatMessages: [ 
          ],
          peerInfo: null,
          stream: null,
          peer: null,
          inConvo: false,
        });
      }
          navigator.mediaDevices.getUserMedia({video:true, audio: true}).then(stream => {
          this.socketConnection(stream);
          })
  }

  //Needs to be finished
  createPeer = (initiator, stream) => {
  var peer = new Peer({initiator: initiator, trickle: false, stream: stream});

  this.setState({inConvo: true});
  
    peer.on("error", (err) => {
      this.setState({chatMessages: [{id: this.state.chatMessages.length, user: "Client", message:  err.code + " Error. Try clicking next, or refreshing if problem persists"}]});
      console.log(err);
      console.log(err.code);
    })

    peer.on("connect", () => {
        peer.send(JSON.stringify({isPublicKey: true, peerPublicKey: localStorage.publicKey}))
        this.setState({chatMessages: []});
    })

    peer.on("data", async (data) => {
      data = JSON.parse(data);

      if(data.isPublicKey === true) {
        sessionStorage.setItem("peerPublicKey", data.peerPublicKey);
        console.log("Public Key Recieved!");
        this.setState({chatMessages: [{id: this.state.chatMessages.length, user: "Client", message:"You can now send messages!"}]});

      } else {

        let privKey = ( await openpgp.key.readArmored(localStorage.privateKey)).keys[0];
        await privKey.decrypt(localStorage.pass);

        let options = {
          message: await openpgp.message.readArmored(data.data),
          privateKeys: [privKey]
        }

        openpgp.decrypt(options).then( (plaintext) => {
          let newMessage = {
            id: this.state.chatMessages.length,
            user: data.user,
            message: plaintext.data 
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

    this.setState({peer: peer, inConvo: true});
    return peer;
  }


  createMessage = async (user, content) => {

      const newMessage = {
        id: this.state.chatMessages.length,
        user: user,
        message: content 
      }

      this.setState({chatMessages: [...this.state.chatMessages, newMessage]});
      let data = openpgp.message.fromText(content);

      let options = {
        message: data,
        publicKeys: ( await openpgp.key.readArmored(sessionStorage.peerPublicKey)).keys,
      }

      try {
      openpgp.encrypt(options).then( (ciphertext) => {
        let data = ciphertext.data;
        this.state.peer.send(JSON.stringify({user: 'Anon', data: data}));
      });    
    } catch (err) {
      this.setState({chatMessages: [{id: this.state.chatMessages.length, user: "Client", message:"There was an error sending the message..."}]});
    } 
  }

  render() {
    return (
      <div className="App"> 
      <SiteIntro />

      <div id = "videoChat">
        <div><h3 id = "logo">Random.moe</h3> <a href="https://www.patreon.com/randomMOE">Patreon</a> | <a href="https://twitter.com/Twitch_NotDem">Twitter</a> | <a href="https://twitch.tv/notdem">Twitch</a> | <a href="https://github.com/paradoxmoe/RandomMOE">Github</a></div>
        <video ref = {clientRef => {this.clientRef = clientRef}} controls muted></video>
        <video ref = {peerRef => {this.peerRef = peerRef}} controls></video>
      </div>
        <div id = "chatApp" class = "disableScrollbars">
          <Chat chatMessages = {this.state.chatMessages} submit = {this.submitButton} />
          <button type="button" onClick = {this.next} ref = {findUsers => {this.findUsers = findUsers}}>Next</button>
        </div>
        {/* <NimblePicker set='messenger' data={data} /> */}
        <CreateMessage createMessage =  {this.createMessage} peer = {this.peer} />
        <CanvasBackground />
      </div>
    );
  }
}

export default App;
