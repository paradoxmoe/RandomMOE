import React, { Component } from 'react';
import * as openpgp from 'openpgp';
class GenerateKeys extends Component {
  
  render() {
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

//console.log(localStorage.publicKey);
}
  //console.log(localStorage.publicKey);
    return (
        null
    )
  };
}



export default GenerateKeys;
