import React, { Component } from 'react';

class SiteIntro extends Component {

  overlay  = () => {
    //this.overlayRef.style.display = 'none';
    this.overlayRef.remove();
  } 
  
  render() {    
    return (
            <div id = "overlay" ref = {overlayRef => {this.overlayRef = overlayRef}} >      
                <div id = "overlayone">
                  <p style= {{color: 'red'}}>Please check the <b>TOP RIGHT</b> (in Chrome) <b>TOP LEFT</b> (in Firefox) of your browser and make sure your webcam/mic is accessible to the browser!<br /></p>
                  <h1>Welcome to Random.moe!</h1>
                  <p>Random.moe is an <a href="https://github.com/openpgpjs/openpgpjs">encrypted</a>, <a href="https://github.com/feross/simple-peer">peer-to-peer</a>, <a href= "https://github.com/paradoxmoe/randommoe">open source</a> random chat alternative to Omegle/Chatroulette/etc.</p>
                  <p>Special thanks to: <a href='http://stackoverflow.com/a/35387759'>Kecer</a> on Stackoverflow and <a href="https://codepen.io/Anomaly942/">Kaustav</a> on CodePen</p>
                </div>

                <div id = "overlaytwo">
                  <p>Youtube Support! Just Copy and Paste a youtube URL into the chat!</p>
                  <iframe width="560" height="315" src="https://www.youtube.com/embed/59UMqAvQoXk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

                  <p>Imgur support! </p>
                  <p><a href="www.twitch.tv">Twitch</a> Support!</p>
                  <p><a href="http://catbox.moe">Catbox</a> Support! Just Copy and Paste a Catbox.moe URL into the chat! (Images and videos!) </p>
                  <p><a href="https://simmer.io">Simmer Support!</a> Just Copy and Paste the <b>embed code</b> into the chat!</p>
                </div>
               
                <div id = "overlaythree">
                  <p>Be aware you are talking to anonymous users, <b style= {{color: 'red'}}>some of whom may have malicious intentions.</b></p>
                  <p>While chat messages are encrypted, <b style= {{color: 'red'}}>there is no expectation of privacy when using Random.moe.</b> Please exercise caution when using this platform.</p>
                  <p>As the site is currently under rapid development, please report bugs or suggestions <a href= "https://github.com/paradoxmoe/RandomMOE/issues">here</a>!</p>
                  <p>We use cookies/local storage to store your PGP encryption keys, so be aware of this.</p>
                  <p>If you don't have a webcam, I'd recommend using <a href="http://www.oldversion.com/windows/manycam-2-6-1">ManyCam</a> (or something similar) </p>
                  <p>If you'd like to contribute to the development of random.moe, please visit our <a href="https://www.patreon.com/randomMOE">Patreon</a>!</p>

                  <p>While a comprehensive privacy policy is in the works, we currently don't collect any data whatsoever on our users. We don't even have a database set up yet.</p>        
                  <p>Random.moe is only for users over 18, with limited exceptions granted by <a href="https://twitter.com/Twitch_NotDem">me.</a> <b style= {{color: 'red'}}>Leave if not 18+</b> (or given my exclusive permission.)</p>
                </div>
                
               
                
                <button onClick={this.overlay}>Click here if you've read the above!</button>

            </div>
    )
  };
}



export default SiteIntro;