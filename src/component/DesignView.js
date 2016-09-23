import React from 'react';

import WidgetActions from '../actions/WidgetActions';
import WidgetStore from '../stores/WidgetStore';

class DesignView extends React.Component {
    constructor(props) {
        super(props);
        this.state={

        };

        this.count=0;
        this.aODiv=[];
        this.curODiv=null;
        this.isDraging =false;
        this.whichDrag=null;
        this.selectNode=null;

        this.scroll = this.scroll.bind(this);
        this.onKeyScroll = this.onKeyScroll.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);


        this.isShowRulerLine = this.isShowRulerLine.bind(this);
        this.mouseDown_top = this.mouseDown_top.bind(this);
        this.mouseDown_left = this.mouseDown_left.bind(this);
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
        console.log(1);
        if(widget.selectWidget){
            this.selectNode =widget.selectWidget;

            if(widget.selectWidget.className == "root"){
                document.body.addEventListener('keyup', this.onKeyScroll);
                document.getElementById('h_ruler').addEventListener('mousedown',this.mouseDown_top);
                document.getElementById('v_ruler').addEventListener('mousedown',this.mouseDown_left);
                document.getElementById('DesignView-Container').addEventListener('mousemove',this.mouseMove);
                document.getElementById('DesignView-Container').addEventListener('mouseup',this.mouseUp);
                this.setRuler(6,10);
            }  else {
                document.body.removeEventListener('keyup', this.onKeyScroll);
            }
            if(widget.selectWidget.props.rulerArr && this.selectNode.props.isShow){
                this.drawLine(widget.selectWidget.props.rulerArr);
            }

        }



        if(widget.setRulerLine){
            this.isShowRulerLine(widget.setRulerLine.isShow);
        }



        if(widget.updateProperties && (widget.updateProperties .width || widget.updateProperties .height)){

            let iWidthSum =Math.floor(widget.updateProperties .width/100);
            let iHeightSum=Math.floor(widget.updateProperties .height/100);
            this.setRuler(iWidthSum,iHeightSum);
        }
    }

    isShowRulerLine(bIsShow){
        this.selectNode.props.isShow =bIsShow;
        let oContainer =document.getElementById('DesignView-Container');
        let oRulerWLine = oContainer.getElementsByClassName('rulerWLine');
        let oRulerHLine = oContainer.getElementsByClassName('rulerHLine');
        for(let i=oRulerWLine.length-1; i>=0;i--){
            oRulerWLine[i].style.display= bIsShow?'block':'none';
        }
        for(let i=oRulerHLine.length-1; i>=0;i--){
            oRulerHLine[i].style.display =bIsShow?'block':'none';
        }

    }

    setRuler(iWidthSum,iHeightSum){

        let oWidth =document.getElementById('h_ruler');
        let oHeight =document.getElementById('v_ruler');


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
        let y  = event.deltaY;
        //let x  = event.deltaX;
        if(y===0 || y===-0) return;
        let top = window.getComputedStyle(this.refs.view,null).getPropertyValue("top");
        let t = parseFloat(top.replace(/(px)?/, ''));
        t -= y/4;

        this.refs.view.style.top = t+'px';
        this.refs.line_top.style.top= t+'px';

        this.aODiv.map(item =>{
            if(item.oDiv.whichDrag =='top'){
                item.oDiv.style.top=(t-item.offsetTop)+'px';
            }else{
                item.oDiv.style.left= item.offsetLeft+'px';
            }
        });
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
            this.refs.canvas_wraper.style.left= l+'px';
            return;
        }
        // up or down
        if(isEvent(38) || isEvent(40)) {
            let top = window.getComputedStyle(this.refs.view,null).getPropertyValue("top");
            let t = parseFloat(top.replace(/(px)?/, ''));
            t += STEP * (isEvent(38) ? -1 : 1);
            this.refs.view.style.top = t+'px';
            this.refs.line_top.style.top= t+'px';
            return;
        }
    }
    drawLine(aODiv){

        let $this =this;
        //清空
        let offsetTop =this.refs.view.offsetTop;
        this.aODiv=[];

        let oContainer =document.getElementById('DesignView-Container');
        let oRulerWLine = oContainer.getElementsByClassName('rulerWLine');
        let oRulerHLine = oContainer.getElementsByClassName('rulerHLine');
        for(let i=oRulerWLine.length-1; i>=0;i--){
            oContainer.removeChild(oRulerWLine[i]);
        }
        for(let i=oRulerHLine.length-1; i>=0;i--){
            oContainer.removeChild(oRulerHLine[i]);
        }
        aODiv.map(item=>{
            let curODiv =  document.createElement('div');
            curODiv.appendChild(document.createElement('div'));

            if(item.oDiv.whichDrag=='top'){
                curODiv.setAttribute('class','rulerWLine');
                curODiv.style.top=(offsetTop-item.offsetTop)+'px';
            }else{
                curODiv.setAttribute('class','rulerHLine');
                curODiv.style.left=item.offsetLeft+'px';
            }
            curODiv.flag=this.count++;
            curODiv.whichDrag =item.oDiv.whichDrag;

            curODiv.onmousedown= function(){
                $this.isDraging=true;
                $this.curODiv=this;
                //清除aODiv中的存储
                $this.aODiv.map((item,index) =>{
                    if(item.oDiv.flag == this.flag){
                        $this.aODiv.splice(index,1);
                    }
                });
                $this.whichDrag =this.whichDrag;
                //解绑事件
                this.onmousedown=null;
            };

            this.refs.container.appendChild(curODiv);
            this.aODiv.push({
                oDiv:curODiv,
                offsetLeft:item.offsetLeft,
                offsetTop:item.offsetTop
            });
        });

    }
    mouseDown_top(event){

        console.log(this.refs.view.offsetTop);

        this.curODiv =  document.createElement('div');
        this.curODiv.appendChild(document.createElement('div'));
        this.curODiv.setAttribute('class','rulerWLine');
        this.refs.container.appendChild(this.curODiv);
        this.isDraging=true;
        this.whichDrag='top';
    }
    mouseDown_left(event){

        this.curODiv =  document.createElement('div');
        this.curODiv.appendChild(document.createElement('div'));
        this.curODiv.setAttribute('class','rulerHLine');
        this.refs.container.appendChild(this.curODiv);
        this.isDraging=true;
        this.whichDrag='left';
    }



    mouseMove(event){
        if(this.curODiv &&  this.isDraging){

            if(this.whichDrag=='top'){
                this.curODiv.style.top = (event.pageY)+'px';
                document.body.style.cursor=' n-resize';
            }else{
                this.curODiv.style.left = (event.pageX)+'px';
                document.body.style.cursor='e-resize';
            }

            if((event.pageY<=this.refs.view.offsetTop && this.refs.view.offsetTop-14 <=event.pageY)||(event.pageX<=this.refs.canvas_wraper.offsetLeft && this.refs.canvas_wraper.offsetLeft-13 <=event.pageX)){
                this.curODiv.style.display='none';
            }else{
                this.curODiv.style.display='block';
            }

        }
    }

    mouseUp(event){
        let $this =this;
        if(this.curODiv) {
            //在x_ruler ,则消失,否则存储
            if((event.pageY<=this.refs.view.offsetTop && this.refs.view.offsetTop-14 <=event.pageY)||(event.pageX<=this.refs.canvas_wraper.offsetLeft && this.refs.canvas_wraper.offsetLeft-13 <=event.pageX) ){
                this.refs.container.removeChild(this.curODiv);
            }else{


                //存在,则修改;不存在,则添加
                this.curODiv.onmousedown= function(){
                    $this.isDraging=true;
                    $this.curODiv=this;
                    //清除aODiv中的存储
                    $this.aODiv.map((item,index) =>{
                        if(item.oDiv.flag == this.flag){
                            $this.aODiv.splice(index,1);
                        }
                    });
                    $this.whichDrag =this.whichDrag;
                    //解绑事件
                    this.onmousedown=null;
                };

                this.curODiv.flag=this.count++;
                this.curODiv.whichDrag=this.whichDrag;
                this.aODiv.push({
                    oDiv:this.curODiv,
                    offsetLeft:event.pageX,
                    offsetTop:this.refs.view.offsetTop -event.pageY
                });


                WidgetStore.currentWidget.props.rulerArr =this.aODiv;

            }
        }
        document.body.style.cursor='auto';
        this.isDraging=false;
        this.curODiv=null;
        this.whichDrag=null;
    }

    render() {

        return (
            <div className='f--hlt'
                 id='DesignView-Container'
                 ref='container'
                 onWheel={this.scroll}>
                <div  ref='line_top' id='line_top'></div>
                <div ref='canvas_wraper' className='canvas-wraper'>
                    <div  ref='line_left'  id='line_left'></div>
                    <div id='canvas-dom'
                         className="DesignView"
                         ref='view'
                         style={{ 'transform' : 'scale('+  this.props.stageZoom / 100 +')' }}>
                        <div className='h_ruler_wraper'><ul  id='h_ruler'></ul></div>
                        <ul id='v_ruler'></ul>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = DesignView;