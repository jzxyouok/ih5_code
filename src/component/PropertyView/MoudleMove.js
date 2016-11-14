/**
 * Created by vxplo on 2016/11/14.
 */
import WidgetStore from '../../stores/WidgetStore';
import WidgetActions from '../../actions/WidgetActions';

class PropertyViewMove {
    constructor(idName,thisObj){
        this.thisObj=thisObj;
        this.idName=idName;

        this.PropertyViewPosition={
            subW:null,
            subH:null,
            isDown:false,
            oPropertyView:null
        };
        this.bind();
    }
    bind(){
        document.getElementById(this.idName).addEventListener('mousedown',this.mouseDown.bind(this));
        document.addEventListener('mousemove', this.mouseMove.bind(this));
        document.addEventListener('mouseup', this.mouseUp.bind(this));
    }
    unBind(){
        document.getElementById(this.idName).removeEventListener('mousedown',this.mouseDown.bind(this));
        document.removeEventListener('mousemove', this.mouseMove.bind(this));
        document.removeEventListener('mouseup', this.mouseUp.bind(this));
    }
    mouseDown(e){
        let oPropertyView = this.thisObj.refs.PropertyView;
        this.PropertyViewPosition.oPropertyView = oPropertyView;
        this.PropertyViewPosition.isDown=true;
        this.PropertyViewPosition.subW =e.pageX-oPropertyView.offsetLeft;
        this.PropertyViewPosition.subH =e.pageY-oPropertyView.offsetTop;
    }

    mouseMove(e){
        if( this.PropertyViewPosition.isDown){
            this.PropertyViewPosition.oPropertyView.style.left =(e.pageX-this.PropertyViewPosition.subW)+'px';
            this.PropertyViewPosition.oPropertyView.style.top =(e.pageY-this.PropertyViewPosition.subH)+'px';
        }
    }

    mouseUp(e){
        if(this.PropertyViewPosition.isDown) {
            let subW = e.pageX - this.PropertyViewPosition.subW;
            let subH = e.pageY - this.PropertyViewPosition.subH;
            let clientWidth = document.body.clientWidth;
            let subRight = clientWidth - subW - 260;
            if (subW < 76) {
                this.PropertyViewPosition.oPropertyView.style.left = this.thisObj.state.expanded? '65px':'37px';
            }
            if (subH < 76) {
                this.PropertyViewPosition.oPropertyView.style.top = '36px';
            }
            if (subRight < 76) {
                this.PropertyViewPosition.oPropertyView.style.left = (clientWidth - 296) + 'px';
            }
            this.PropertyViewPosition.isDown = false;
            this.PropertyViewPosition.oPropertyView = null;
        }
    }
}
class DesignViewMove{
    constructor(idName,thisObj){
        this.oCanvas=document.getElementById(idName);
        this.thisObj=thisObj;
        this.canvasObj={
            subW:null,
            subH:null,
            canvasWraper:null,
            oCanvasDom:null
        };
        this.bind();
    }
    bind(){
        this.oCanvas.addEventListener('mousedown',this.canvasMousedown.bind(this));
        this.oCanvas.addEventListener('mousemove',this.canvasMouseMove.bind(this));
        this.oCanvas.addEventListener('mouseup',this.canvasMouseUp.bind(this));
    }
    unBind(){
        this.oCanvas.removeEventListener('mousedown',this.canvasMousedown.bind(this));
        this.oCanvas.removeEventListener('mousemove',this.canvasMouseMove.bind(this));
        this.oCanvas.removeEventListener('mouseup',this.canvasMouseUp.bind(this));
    }
    canvasMousedown(e) {
        if (this.thisObj.state.space) {
            e.preventDefault();
            let oCanvasWraper =  this.thisObj.refs.canvasWraper;
            let oCanvasDom =  this.thisObj.refs.view;
            this.canvasObj.canvasWraper = oCanvasWraper;
            this.canvasObj.oCanvasDom = oCanvasDom;
            this.thisObj.setState({
                isDown: true
            });
            this.canvasObj.subW = e.pageX - oCanvasWraper.offsetLeft;
            this.canvasObj.subH = e.pageY - oCanvasDom.offsetTop;
        }
    }

    canvasMouseMove(e){
        if( this.thisObj.state.space &&  this.thisObj.state.isDown){
            e.preventDefault();
            this.canvasObj.canvasWraper.style.left =(e.pageX-this.canvasObj.subW+320)+'px';
            this.canvasObj.oCanvasDom.style.top =(e.pageY-this.canvasObj.subH)+'px';

            this.thisObj.drawLine( this.thisObj.aODiv);
        }
    }

    canvasMouseUp(e){
        e.preventDefault();
        if ( this.thisObj.state.isDown) {
            this.thisObj.setState({
                isDown:false
            });
            this.canvasObj.canvasWraper = null;
            this.canvasObj.oCanvasDom = null;
        }
    }
}
class DesignViewLineMove {
    constructor(thisObj) {
        this.thisObj = thisObj;
        this.bind();
    }

    bind(){
        document.getElementById('h_ruler').addEventListener('mousedown',this.mouseDown_top.bind(this));
        document.getElementById('v_ruler').addEventListener('mousedown',this.mouseDown_left.bind(this));
        document.getElementById('DesignView-Container').addEventListener('mousemove',this.mouseMove.bind(this));
        document.getElementById('DesignView-Container').addEventListener('mouseup',this.mouseUp.bind(this));
    }

    unBind(){
        document.getElementById('h_ruler').removeEventListener('mousedown', this.mouseDown_top.bind(this));
        document.getElementById('v_ruler').removeEventListener('mousedown', this.mouseDown_left.bind(this));
        document.getElementById('DesignView-Container').removeEventListener('mousemove', this.mouseMove.bind(this));
        document.getElementById('DesignView-Container').removeEventListener('mouseup', this.mouseUp.bind(this));
    }

    mouseDown_top(event) {
        event.stopPropagation();
        this.thisObj.curODiv = document.createElement('div');
        this.thisObj.curODiv.appendChild(document.createElement('div'));
        this.thisObj.curODiv.setAttribute('class', 'rulerWLine');
        this.thisObj.refs.container.appendChild(this.thisObj.curODiv);
        this.thisObj.isDraging = true;
        this.thisObj.whichDrag = 'top';
    }

    mouseDown_left(event) {
        event.stopPropagation();
        this.thisObj.curODiv = document.createElement('div');
        this.thisObj.curODiv.appendChild(document.createElement('div'));
        this.thisObj.curODiv.setAttribute('class', 'rulerHLine');
        this.thisObj.refs.container.appendChild(this.thisObj.curODiv);
        this.thisObj.isDraging = true;
        this.thisObj.whichDrag = 'left';
    }

    mouseMove(event) {
        if (this.thisObj.curODiv && this.thisObj.isDraging) {
            event.stopPropagation();
            if (this.thisObj.whichDrag == 'top') {
                this.thisObj.curODiv.style.top = (event.pageY) + 'px';

                document.body.style.cursor = ' n-resize';
            } else {
                this.thisObj.curODiv.style.left = (event.pageX) + 'px';
                document.body.style.cursor = 'e-resize';
            }
            if ((event.pageY <= this.thisObj.refs.view.offsetTop + this.thisObj.stageZoomTop && this.thisObj.refs.view.offsetTop + this.thisObj.stageZoomTop - 14 <= event.pageY) || (event.pageX <= this.thisObj.refs.canvasWraper.offsetLeft + this.thisObj.stageZoomLeft && this.thisObj.refs.canvasWraper.offsetLeft + this.thisObj.stageZoomLeft - 13 <= event.pageX)) {
                this.thisObj.curODiv.style.display = 'none';
            } else {
                this.thisObj.curODiv.style.display = 'block';
            }

        }
    }

    mouseUp(event) {
        let $this = this.thisObj;
        if (this.thisObj.curODiv) {
            event.stopPropagation();
            //在x_ruler ,则消失,否则存储
            if ((event.pageY <= this.thisObj.refs.view.offsetTop + this.thisObj.stageZoomTop && this.thisObj.refs.view.offsetTop + this.thisObj.stageZoomTop - 14 <= event.pageY) || (event.pageX <= this.thisObj.refs.canvasWraper.offsetLeft + this.thisObj.stageZoomLeft && this.thisObj.refs.canvasWraper.offsetLeft + this.thisObj.stageZoomLeft - 13 <= event.pageX)) {
                this.thisObj.refs.container.removeChild(this.thisObj.curODiv);
            } else {
                //存在,则修改;不存在,则添加
                this.thisObj.curODiv.onmousedown = function () {
                    $this.isDraging = true;
                    $this.curODiv = this.thisObj;
                    //清除aODiv中的存储
                    $this.aODiv.map((item, index) => {
                        if (item.oDiv.flag == this.thisObj.flag) {
                            $this.aODiv.splice(index, 1);
                        }
                    });
                    $this.whichDrag = this.thisObj.whichDrag;
                    //解绑事件
                    this.thisObj.onmousedown = null;
                };

                this.thisObj.curODiv.flag = this.thisObj.count++;
                this.thisObj.curODiv.whichDrag = this.thisObj.whichDrag;
                this.thisObj.aODiv.push({
                    oDiv: this.thisObj.curODiv,
                    offsetLeft: (event.pageX - this.thisObj.refs.canvasWraper.offsetLeft) / this.thisObj.stageZoomRate,
                    offsetTop: (this.thisObj.refs.view.offsetTop + this.thisObj.stageZoomTop - event.pageY) / this.thisObj.stageZoomRate
                });
                WidgetStore.currentWidget.props.rulerArr = this.thisObj.aODiv;
            }
            document.body.style.cursor = 'auto';
            this.thisObj.isDraging = false;
            this.thisObj.curODiv = null;
            this.thisObj.whichDrag = null;
            //全部显示 ,如果处于非显示状态,则触发显示
            if (this.thisObj.selectNode && this.thisObj.selectNode.props.isShow != undefined && !this.thisObj.selectNode.props.isShow) {
                WidgetActions['setRulerLineBtn'](true);
            }
        }
    }
}
module.exports = {PropertyViewMove,DesignViewMove,DesignViewLineMove};