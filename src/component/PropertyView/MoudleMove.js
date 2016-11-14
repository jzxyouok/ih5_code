/**
 * Created by vxplo on 2016/11/14.
 */

class MoudleMove {
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

module.exports = MoudleMove;