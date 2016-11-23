import React from 'react';
import cls from 'classnames';
import WidgetActions from '../actions/WidgetActions';
import WidgetStore from '../stores/WidgetStore';
import {DesignViewMove,DesignViewLineMove} from './PropertyView/MoudleMove';
import { message } from 'antd';

message.config({
    top: 37,
    duration: 1.5,
});

class DesignView extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            space:false,
            isDown:false,
            activeBlockMode: false
        };

        this.count=0;
        this.aODiv=[];
        this.curODiv=null;
        this.isDraging =false;
        this.whichDrag=null;
        this.selectNode=null;
        this.rootWidget=null;
        this.stageZoom=100;
        this.stageZoomRate=1;
        this.stageZoomTop=0;
        this.stageZoomLeft=0;
        this.keyboard=false;

        this.moudleMove=null;
        this.designViewLineMove=null;

        this.scroll = this.scroll.bind(this);
        this.onKeyScroll = this.onKeyScroll.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onresize=this.onresize.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.isShowRulerLine = this.isShowRulerLine.bind(this);

        this.blockModeWarning = this.blockModeWarning.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
        window.onresize=this.onresize;
        this.setRuler(6,10);  //设置基准线
        document.body.addEventListener('keydown', this.onKeyScroll);
        document.body.addEventListener('keyup', this.onKeyUp);

        this.moudleMove=new DesignViewMove('canvas-dom',this);
        this.designViewLineMove =new DesignViewLineMove(this);
    }

    componentWillUnmount() {
        this.unsubscribe();
        window.onresize = null;
        document.body.removeEventListener('keydown', this.onKeyScroll);
        document.body.removeEventListener('keyup', this.onKeyUp);

        this.moudleMove.unBind();
        this.designViewLineMove.unBind();
    }

    onStatusChange(widget) {
        if(widget.selectWidget){
            this.selectNode =widget.selectWidget;
            if(widget.selectWidget.className == "root" && widget.selectWidget.props.name == "stage") {
                this.rootWidget = widget.selectWidget;
            }
            //isShow没有定义时和确定显示的时候才执行
            if(widget.selectWidget.props.rulerArr &&( this.selectNode.props.isShow ||  this.selectNode.props.isShow===undefined)){
                this.drawLine(widget.selectWidget.props.rulerArr);
            }else if(widget.selectWidget.props.rulerArr === undefined){
                this.drawLine([]);
            }


            //点击舞台后,整个页面会渲染一遍,导致属性面板的失焦事件不能发生,强行让它发生一遍
            let oPropertyView =  document.getElementById('PropertyView').getElementsByClassName('ant-input')[0];
            if(oPropertyView){
                oPropertyView.focus();
                oPropertyView.blur();
            }

            setTimeout(function () {
                //点击舞台后,整个页面会渲染一遍,导致浏览器失焦,导致ctrl+s的时候不能阻止默认的保存事件,导致要写下面无奈的代码
                let oPropertyView =  document.getElementById('PropertyView').getElementsByClassName('ant-input')[0];
                if(oPropertyView){
                    oPropertyView.focus();
                    oPropertyView.blur();
                }
            },300)
        } else if (widget.activeBlockMode) {
            this.setState({
                activeBlockMode: widget.activeBlockMode.on
            })
        }
        if(widget.setRulerLine){
            this.isShowRulerLine(widget.setRulerLine.isShow);
        }

        if(widget.updateProperties && (widget.updateProperties .width || widget.updateProperties .height)){
            let iWidthSum =Math.floor(widget.updateProperties .width/100);
            let iHeightSum=Math.floor(widget.updateProperties .height/100);
            this.setRuler(iWidthSum,iHeightSum);
        }

        if(widget.closeKeyboardMove){
            this.keyboard =widget.closeKeyboardMove.val
        }else{
            this.keyboard=false;
        }
    }

    stageZoomChange(){
        if(this.selectNode && this.stageZoom != this.props.stageZoom){

            this.stageZoom = this.props.stageZoom;
            this.stageZoomRate =this.stageZoom/100;

            let k= (100-this.props.stageZoom)/200;
            this.stageZoomTop=  this.rootWidget.node.height*k;
            this.stageZoomLeft=this.rootWidget.node.width*k;

            let aODiv =this.aODiv;
            this.drawLine(aODiv);
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
        // event.preventDefault();
        event.stopPropagation();

        let y  = event.deltaY;
        //let x  = event.deltaX;
        if(y===0 || y===-0) return;
        let top = window.getComputedStyle(this.refs.view,null).getPropertyValue("top");
        let t = parseFloat(top.replace(/(px)?/, ''));
        t -= y/4;

        this.refs.view.style.top = t+'px';
        this.refs.line_top.style.top= (t+this.stageZoomTop)+'px';

        this.aODiv.map(item =>{
            if(item.oDiv.whichDrag =='top'){
                item.oDiv.style.top=(t+this.stageZoomTop-item.offsetTop*this.stageZoomRate)+'px';
            }
        });
    }

    onKeyUp(event){
        //空格键
        if( event.keyCode == 32){

            this.setState({
                space:false
            });
        }
    }

    onKeyScroll(event) {
        if(this.rootWidget.className !=='root') {
            return;
        }
        if(event.target.nodeName==='INPUT' || event.target.nodeName==='TEXTAREA') {
            return;
        }

        if(!this.keyboard) {

            const STEP = 100;
            let isEvent = (keycode) => event.keycode === keycode || event.which === keycode;

            // left or right
            if (isEvent(37) || isEvent(39)) {
                event.stopPropagation();
                let left = window.getComputedStyle(this.refs.view, null).getPropertyValue("left");
                let l = parseFloat(left.replace(/(px)?/, ''));
                l += STEP * (isEvent(37) ? -1 : 1);

                let subLeft =this.refs.canvasWraper.offsetLeft+320;

                this.refs.canvasWraper.style.left =subLeft + l + 'px';

                this.aODiv.map(item => {
                    if (item.oDiv.whichDrag == 'left') {
                        item.oDiv.style.left = (this.refs.canvasWraper.offsetLeft + this.stageZoomLeft + item.offsetLeft * this.stageZoomRate) + 'px';
                    }
                });
                return;
            }
            // up or down
            if (isEvent(38) || isEvent(40)) {
                event.stopPropagation();
                let top = window.getComputedStyle(this.refs.view, null).getPropertyValue("top");
                let t = parseFloat(top.replace(/(px)?/, ''));
                t += STEP * (isEvent(38) ? -1 : 1);

                this.refs.view.style.top = t + 'px';
                this.refs.line_top.style.top = t + this.stageZoomTop + 'px';

                this.aODiv.map(item => {
                    if (item.oDiv.whichDrag == 'top') {
                        item.oDiv.style.top = (t + this.stageZoomTop - item.offsetTop * this.stageZoomRate) + 'px';
                    } else {
                        item.oDiv.style.left = (this.refs.canvasWraper.offsetLeft + this.stageZoomLeft + item.offsetLeft * this.stageZoomRate) + 'px';
                    }
                });

                return;
            }
        }

        //空格键
        if( event.keyCode == 32){
            this.setState({
                space:true
            });
        }
    }

    onresize(){
        let aODiv =this.aODiv;
        this.drawLine(aODiv);
    }

    isShowRulerLine(bIsShow){
        this.selectNode.props.isShow =bIsShow;
        let oContainer =document.getElementById('DesignView-Container');
        let oRulerWLine = oContainer.getElementsByClassName('rulerWLine');
        let oRulerHLine = oContainer.getElementsByClassName('rulerHLine');

        let oLine_top = document.getElementById('line_top');
        let oLine_left =document.getElementById('line_left');

        for(let i=oRulerWLine.length-1; i>=0;i--){
            oRulerWLine[i].style.display= bIsShow?'block':'none';
        }
        for(let i=oRulerHLine.length-1; i>=0;i--){
            oRulerHLine[i].style.display =bIsShow?'block':'none';
        }
        oLine_top.style.display =bIsShow?'block':'none';
        oLine_left.style.display =bIsShow?'block':'none';

    }

    drawLine(aODiv){
        let $this =this;

        //清空
        let offsetTop =this.refs.view.offsetTop+this.stageZoomTop;
        let offsetLeft =this.refs.canvasWraper.offsetLeft + this.stageZoomLeft;

        //设置主对齐线
        this.refs.line_top.style.top=(offsetTop)+'px';
        this.refs.line_left.style.left=this.stageZoomLeft+'px';

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
                curODiv.style.top=(offsetTop-item.offsetTop*this.stageZoomRate)+'px';
            }else{
                curODiv.setAttribute('class','rulerHLine');
                curODiv.style.left=(offsetLeft+item.offsetLeft*this.stageZoomRate)+'px';
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

    blockModeWarning() {
        message.warning('自定义小模块编辑中...');
    }

    render() {
        //缩放后设置参考线位置
        this.stageZoomChange();
        return (
            <div
                id='DesignView-Container'
                ref='container'
                onWheel={this.scroll}
                className={cls({'moveTag':this.state.space&&this.state.isDown,'no-moveTag':this.state.space&&!this.state.isDown})}
            >
                <div  ref='line_top' id='line_top'></div>
                <div ref='canvasWraper' className='canvas-wraper' id="canvas-wraper" >
                    <div  ref='line_left'  id='line_left'></div>
                    <div id='canvas-dom'
                         className="DesignView"
                         ref='view'
                         style={{ 'transform' : 'scale('+  this.props.stageZoom / 100 +')' }}>
                      <div className='h_ruler_wraper'><ul  id='h_ruler'></ul></div>
                      <ul id='v_ruler'></ul>
                    </div>
                </div>
                <div onClick={this.blockModeWarning} className={cls('block-mode-cover', {'cover-show':this.state.activeBlockMode})}></div>
            </div>
        );
    }
}

module.exports = DesignView;