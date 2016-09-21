import React from 'react';

import WidgetActions from '../actions/WidgetActions';
import WidgetStore from '../stores/WidgetStore';




class DesignView extends React.Component {
    constructor(props) {
        super(props);
        this.state={

        };

        this.isDraging =false;
        this.pointX=null;
        this.pointY=null;
        this.canvas_x=null;
        this.canvas_y=null;
        this.canvas_w=null;
        this.canvas_h=null;

        
        this.scroll = this.scroll.bind(this);
        this.onKeyScroll = this.onKeyScroll.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);


        this.mouseDown = this.mouseDown.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseUp = this.mouseUp.bind(this);

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

                document.getElementsByClassName('h_ruler')[0].addEventListener('mousedown',this.mouseDown);

                document.getElementById('canvas-dom').lastElementChild.addEventListener('mousemove',this.mouseMove)

                document.getElementById('canvas-dom').lastElementChild.addEventListener('mouseup',this.mouseUp)

                this.setRuler(6,10);

            }
            else {
                document.body.removeEventListener('keyup', this.onKeyScroll);
            }
        }

        if(widget.updateProperties && (widget.updateProperties .width || widget.updateProperties .height)){

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

    mouseDown(event){
        let oDiv =  document.createElement('div');
        let oCanvas = document.getElementById('canvas-dom');
        let oCanvasRect =oCanvas.getBoundingClientRect();

        oDiv.setAttribute('class','rulerWLine');

        oCanvas.appendChild(oDiv);

         this.isDraging=true;

         console.log(oCanvasRect);

    }

    mouseMove(event){
        //if(oDiv){
        //    oDiv.style.top = (event.pageY-domTop)+'px';
        //}
    }
    mouseUp(event){
        this.isDraging=false;
        //在canvas中,把线固定下来

        //不在convas中,把线取消
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
