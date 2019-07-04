import React, { Component } from 'react';
import Messages from './Messages';
import PropTypes from 'prop-types';

class Chat extends Component {

  render() {    
   // console.log(this.props.chatMessages);
    return (
       // <showButton />
        this.props.chatMessages.map(chatItems => (
            <Messages key = {chatItems.id} chatItems = {chatItems}/>
        
     ))
     
    );
  }
}

Chat.propTypes = {
    chatMessages: PropTypes.array.isRequired
}

export default Chat;

/*

        <video controls autoplay>
          <source src="https://files.catbox.moe/d0sb20.mp4" type="video/mp4"></source>
        </video>

*/