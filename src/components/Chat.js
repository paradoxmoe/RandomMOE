import React, { Component } from 'react';
import Messages from './Messages';
import PropTypes from 'prop-types';

class Chat extends Component {

  constructor(props) {
    super(props)

    this.state = {
        backgroundChatColor: this.props.backgroundChatColor
    }

}   

 componentDidUpdate () {
   if(this.state.backgroundChatColor != this.props.backgroundChatColor) {
     this.setState({backgroundChatColor: this.props.backgroundChatColor})
   }
 }

  render() {    
   // console.log(this.props.chatMessages);
/*  
   if(typeof this.props.bgChatColor == 'undefined') {
    this.props.bgChatColor = ['#FFDAB9', '#FFD700'];
  }
*/
    return (
       // <showButton />

        this.props.chatMessages.map(chatItems => (
            <Messages backgroundChatColor = {this.state.backgroundChatColor} key = {chatItems.id} chatItems = {chatItems}/>
        
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