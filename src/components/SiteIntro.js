import React, { Component } from 'react';

class SiteIntro extends Component {

  overlay  = () => {
    this.overlayRef.style.display = 'none';
  } 
  
  render() {    

    return (
            <div id = "overlay" ref = {overlayRef => {this.overlayRef = overlayRef}} >      
                <p>Please check the <b>TOP RIGHT</b> (in Chrome) <b>TOP LEFT</b> (in Firefox) of your browser and make sure your webcam/mic is accessible to the browser!<br /></p>
                <p>Welcome to Random.moe!</p>
                <p>Random.moe is an <a href="https://github.com/openpgpjs/openpgpjs">encrypted</a>, <a href="https://github.com/feross/simple-peer">peer-to-peer</a>, <a href= "https://github.com/paradoxmoe/paradox">open source</a> random chat alternative to Omegle/Chatroulette/etc.</p>
                <p>Special thanks to: <a href='http://stackoverflow.com/a/35387759'>Kecer</a> on Stackoverflow and <a href="https://codepen.io/Anomaly942/">Kaustav</a> on CodePen</p>
            
                <p>Youtube Support! Just Copy and Paste a youtube URL into the chat!</p>

                <iframe width="560" height="315" src="https://www.youtube.com/embed/59UMqAvQoXk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

                <p>Imgur support! </p>
                <p><a href="www.twitch.tv">Twitch</a> Support!</p>
                <p><a href="http://catbox.moe">Catbox</a> Support! Just Copy and Paste a Catbox.moe URL into the chat! (Images and videos!) </p>
                <p><a href="https://simmer.io">Simmer Support!</a> Just Copy and Paste the <b>embed code</b> into the chat!</p>
                
                <p>As the site is currently in Early Access, please report bugs or other issues <a href= "https://github.com/paradoxmoe/RandomMOE/issues">here</a>!</p>
                <p>Furthermore, as you are talking to random and anonymous users, please exercise caution when using this platform.</p>
                <p>We use cookies/local storage to store your PGP encryption keys, so be aware of this.</p>

                <p>If you'd like to contribute to the success of random.moe, please visit our <a href="https://www.patreon.com/randomMOE">Patreon</a>!</p>
                <button onClick={this.overlay}>Click here if you've read the above!</button>

            </div>
    )
  };
}



export default SiteIntro;