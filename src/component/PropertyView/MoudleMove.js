/**
 * Created by vxplo on 2016/11/14.
 */

class PropertyViewMove {
    constructor(idName,thisObj){
        this.thisObj=thisObj;
        this.idName=idName;
        this.expanded=false;
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
                this.PropertyViewPosition.oPropertyView.style.left = this.expanded? '65px':'37px';
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
        this.space=false;
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
        if (this.space) {
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
        if( this.space &&  this.thisObj.state.isDown){
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

module.exports = {PropertyViewMove,DesignViewMove};