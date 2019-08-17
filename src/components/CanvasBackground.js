//https://codepen.io/Anomaly942/pen/pOqRrz?editors=0010
//https://codepen.io/kevincardona1/pen/LWwZyx

import React, { Component } from 'react';
import { brotliDecompress } from 'zlib';

class CanvasBackground extends Component {

    constructor(props) {
        super(props);
        
        
        this.fillcolor = "#000000";
        this.strokecolor = "#000000";
        this.strokesize = "#000000";
        
        this.state = {width: window.innerWidth, height: window.innerHeight};      
    }

    componentWillMount() {
      //this.onResize();
    }

    componentDidMount() {
        this.ctx = this.canvasRef.getContext('2d');
        this.setState({width: window.innerWidth, height: window.innerHeight});    
        window.addEventListener('resize', this.onResize);
        this.onResize();
        this.createCanvasBackground();
      }
    
      componentDidUpdate() {
        this.createCanvasBackground();
      }

    lineGradient = (x, y, xEnd, yEnd, color1, color2) => {
        let gradient = this.ctx.createLinearGradient(x, y, xEnd, yEnd);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    }

    radialGradient = (x, y, rad, xEnd, yEnd, radEnd, color1, color2) => {
      let gradient = this.ctx.createRadialGradient(x, y, rad, xEnd, yEnd, radEnd, color1, color2);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      return gradient;
    }

    rand = (start, end) => {
      return Math.ceil(Math.random() * (end - start) + start);
    }

    canvasSize = () => {
        this.canvasRef.width = this.state.width;
        this.canvasRef.height = this.state.height;
        //this.setState({canvasRef: this.canvasRef});
    }

    fill = (col_hex) => {
        this.fillcolor = col_hex;
    }

    stroke = (col_hex) => {
      this.strokecolor = col_hex;
    }

    border = (int_pix) => {
      this.strokesize = int_pix;
    }

    rect = (x, y, sizeX, sizeY) => {
        this.ctx.fillStyle = this.fillcolor;
        this.ctx.strokeStyle = this.strokecolor;
        this.ctx.lineWidth = this.strokesize;
        this.ctx.beginPath();
        this.ctx.rect(x, y, sizeX, sizeY);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();

        //this.setState({ctx: this.ctx}); 
    }

    circle = (x, y, radius) => {
      this.ctx.fillStyle = this.fillcolor;
      this.ctx.strokeStyle = this.strokecolor;
      this.ctx.lineWidth = this.strokesize;

      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI*2, false);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.closePath();

    }

    point = (x, y) => {
      this.ctx.fillStyle = this.fillcolor;
      this.ctx.strokeStyle = this.strokecolor;
      this.ctx.lineWidth = this.strokeSize;

      this.ctx.beginPath();
      this.ctx.rect(x, y, 1, 1);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.closePath();
    }

    
    canvasBackgroundFill = () => {
        this.fill(this.lineGradient(this.state.width/1, 0, this.state.width/2, this.state.height * 1.3, "#200030", '#9c046e'));
        this.rect(0, 0, this.state.width, this.state.height);
    }
    
    stars = () => {
      this.stroke("#ffffff");
      this.border(Math.min((this.state.width / 1440), (this.state.height / 900)) * 1.5);
      for(let i = 0; i < (this.state.width / 1.5); i++) {
        this.point(this.rand(0, this.state.width), this.rand(0, this.state.width));
      }
      this.stroke("#ffffff00");
    }

    sun = () => {
      var radius = Math.min((this.state.width/1440), (this.state.height/900)) * 400;
      this.fill(this.lineGradient(this.state.width/2,0,this.state.width/2,this.state.height*1.1, "#ff4400", "#ffff00"));
      this.circle(this.state.width/2, this.state.height/2, radius);
    }

    water = () => {
      this.fill(this.radialGradient((this.state.width / 2), (this.state.height * (2/3)), ((this.state.width / 1440)*100), (this.state.width / 2), (this.state.height * (2/3)), ((this.state.height / 900) * 600), "#002244cc", "#000044cc")); 
      this.rect(0, this.state.height*(2/3), this.state.width, this.state.height / 3);
    }

    onResize = () => {
        this.setState({width: window.innerWidth, height: window.innerHeight});
        this.canvasSize();
        this.createCanvasBackground();
    }

    createCanvasBackground = () => {
      if(this.props.backgroundImage != '' && this.props.backgroundImage != null) {
        var img = new Image;
        img.src = this.props.backgroundImage;
        img.onload = () => {
          this.ctx.drawImage(img, 0, 0, this.state.width, this.state.height)
        }
      } else {
        this.canvasBackgroundFill();
        this.stars();
        this.sun();
        this.water();
      }



        //ctx.font = "30px Arial";
        //ctx.strokeText("Hello CanvasBackground", 10, 50);
          //var width = window.innerWidth;
          //var height = window.innerHeight;
    
    
    }

  render() {    
 
    return (
        <canvas ref= {canvasRef => {this.canvasRef = canvasRef}}>

        </canvas>
    )
  }
}

export default CanvasBackground;