import React from 'react';

import WidgetActions from '../actions/WidgetActions';
import WidgetStore from '../stores/WidgetStore';

var oDiv=null;
var domTop =null;
var dragTag=false;

class DesignView extends React.Component {
    constructor(props) {
        super(props);
        this.state={

        };

        this.scroll = this.scroll.bind(this);
        this.onKeyScroll = this.onKeyScroll.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);


        this.dragTopLine = this.dragTopLine.bind(this);
        this.moveTopLine = this.moveTopLine.bind(this);
        this.releaseTopLine = this.releaseTopLine.bind(this);

    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);


        this.onStatusChange(WidgetStore.getStore());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }


    onStatusChange(widget) {

        if(widget.selectWidget){
            if(widget.selectWidget.className == "root"){

                document.body.addEventListener('keyup', this.onKeyScroll);

                document.getElementsByClassName('h_ruler')[0].addEventListener('mousedown',this.dragTopLine);

                document.getElementById('canvas-dom').lastElementChild.addEventListener('mousemove',this.moveTopLine)

                document.getElementById('canvas-dom').lastElementChild.addEventListener('mouseup',this.releaseTopLine)



                this.setRuler(6,10);

            }
            else {
                document.body.removeEventListener('keyup', this.onKeyScroll);
            }
        }

        if(widget.updateProperties && (widget.updateProperties .width || widget.updateProperties .height)){
              //��߸ı�
            let iWidthSum =Math.floor(widget.updateProperties .width/100);
            let iHeightSum=Math.floor(widget.updateProperties .height/100);
            this.setRuler(iWidthSum,iHeightSum);
        }
    }

    setRuler(iWidthSum,iHeightSum){

        let oWidth =document.getElementsByClassName('h_ruler')[0];
        let oHeight =document.getElementsByClassName('v_ruler')[0];


       if(iWidthSum){
           let sWidth='';
           for(let i = 0 ;i<=iWidthSum;i++){
               sWidth+='<li>'+i*100+'</li>'
           }
           oWidth.innerHTML=sWidth;
       }
        if(iHeightSum){
            let sHeight='';
            for(let i = 0 ;i<=iHeightSum;i++){
                sHeight+='<li><span>'+i*100+'</span></li>'
            }
            oHeight.innerHTML =sHeight;
        }

    }

    scroll(event) {
        event.preventDefault();
        event.stopPropagation();
        //console.log(event);
        let y  = event.deltaY;
        //let x  = event.deltaX;
        if(y===0 || y===-0) return;
        let top = window.getComputedStyle(this.refs.view,null).getPropertyValue("top");
        let t = parseFloat(top.replace(/(px)?/, ''));
        t -= y/4;
        this.refs.view.style.top = t+'px';
    }

    dragTopLine(event){

       oDiv =  document.createElement('div');
       oDiv.setAttribute('class','rulerWLine');
        document.getElementById('canvas-dom').appendChild(oDiv);
        domTop =document.getElementById('canvas-dom').offsetTop;
        dragTag=true;
    }



    moveTopLine(event){

        if(oDiv){
            oDiv.style.top = (event.pageY-domTop)+'px';
        }

    }
    releaseTopLine(event){


    }

    onKeyScroll(event) {
        event.preventDefault();
        event.stopPropagation();

        const STEP = 100;
        let isEvent = (keycode) => event.keycode===keycode || event.which===keycode;

        // left or right
        if(isEvent(37) || isEvent(39)) {
            let left = window.getComputedStyle(this.refs.view,null).getPropertyValue("left");
            let l = parseFloat(left.replace(/(px)?/, ''));
            l += STEP * (isEvent(37) ? -1 : 1);
            this.refs.view.style.left = l+'px';
            return;
        }
        // up or down
        if(isEvent(38) || isEvent(40)) {
            let top = window.getComputedStyle(this.refs.view,null).getPropertyValue("top");
            let t = parseFloat(top.replace(/(px)?/, ''));
            t += STEP * (isEvent(38) ? -1 : 1);
            this.refs.view.style.top = t+'px';
            return;
        }
    }

    render() {
        return (
        <div className='f--hlt'
            id='DesignView-Container'
            ref='container'
            onWheel={this.scroll}>
           <div>
            <div id='canvas-dom'
                className="DesignView"
                ref='view'
                style={{ 'transform' : 'scale('+  this.props.stageZoom / 100 +')' }}>
                <div className='h_ruler_wraper'><ul  className='h_ruler'></ul></div>
                <ul className='v_ruler'></ul>
            </div>
           </div>
        </div>
        );
    }
}

module.exports = DesignView;
