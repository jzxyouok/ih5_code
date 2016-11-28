import {Deferred} from '../../utils/Promise';

export default class DrawRect {
    constructor () {
        this.startX = 0;
        this.startY = 0;
        this.rectLeft = '0px';
        this.rectTop = '0px';
        this.rectHeight = '0px';
        this.rectWidth = '0px';
        this.flag = false;
        this.result = {};
        this.def = new Deferred();
        this.widget = null;

        this.designerView = document.getElementById('iH5-App');

        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);

        this.addDrawRectEventListener = this.addDrawRectEventListener.bind(this);
        this.removeDrawRectEventListener = this.removeDrawRectEventListener.bind(this);

        this.start = this.start.bind(this);
        this.end = this.end.bind(this);
        this.cleanUp = this.cleanUp.bind(this);

        this.addDrawRectOverlay = this.addDrawRectOverlay.bind(this);
        this.addDrawRect = this.addDrawRect.bind(this);
    }

    start(widget) {
        if(widget) {
            this.widget = widget;
        }
        this.addDrawRectOverlay();
        this.addDrawRectEventListener();
    }

    cleanUp() {
        if (document.getElementById('drawRectOverlay')) {
            this.designerView.removeChild(document.getElementById('drawRectOverlay'));
        }
    }
    end() {
        this.removeDrawRectEventListener();
    }

    addDrawRectOverlay() {
        var drawRectOverlay = document.createElement('div');
        drawRectOverlay.id = 'drawRectOverlay';
        drawRectOverlay.style.position = 'fixed';
        drawRectOverlay.style.left = 0;
        drawRectOverlay.style.right = 0;
        drawRectOverlay.style.bottom = 0;
        drawRectOverlay.style.top = 0;
        drawRectOverlay.backgroundColor = 'black';
        drawRectOverlay.tabIndex = 'drawRectOverlay';
        drawRectOverlay.style.zIndex = 109;
        this.designerView.appendChild(drawRectOverlay);
    }

    addDrawRect() {
        var div = document.createElement('div');
        div.id = 'drawRect';
        div.className = 'div';
        div.style.position = 'absolute';
        div.style.left = this.startX + 'px';
        div.style.top = this.startY + 'px';
        div.style.backgroundColor = '#a0a0a0';
        div.style.opacity = '0.2';
        div.style.border = '1px solid #000';

        var drawRectOverlay = document.getElementById('drawRectOverlay');
        drawRectOverlay.appendChild(div);
    }

    onMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        this.flag = true;
        //创建临时的方框div
        var evt = window.event || e;
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
        this.startX = evt.clientX + scrollLeft;
        this.startY = evt.clientY + scrollTop;
        this.addDrawRect();
    }

    onMouseUp(e)  {
        e.preventDefault();
        e.stopPropagation();
        //画图结束
        var canvasRect = document.getElementById('canvas-dom').getBoundingClientRect();
        var result = {
            shapeWidth: parseInt(this.rectWidth),
            shapeHeight: parseInt(this.rectHeight),
            positionX: parseInt(this.rectLeft) - canvasRect.left,
            positionY: parseInt(this.rectTop) - canvasRect.top
        };
        if(this.widget&&this.widget.className !=='root') {
            //计算当前widget的绝对位置然后算出画框的相对位置
            let calWidget = this.widget;
            let pPositionX = 0;
            let pPositionY = 0;
            while(calWidget&&calWidget.className!=='root') {
                if(calWidget.node.positionX) {
                    pPositionX+=calWidget.node.positionX;
                }
                if(calWidget.node.positionY) {
                    pPositionY+=calWidget.node.positionY;
                }
                calWidget = calWidget.parent;
            }
            result.positionX -= pPositionX;
            result.positionY -= pPositionY;
            this.widget = null;
        }
        this.result = result;
        if(this.flag) {
            this.def.resolve(this.result);
        } else {
            this.def.reject();
        }
    }

    onMouseMove(e)  {
        e.preventDefault();
        e.stopPropagation();
        if(this.flag){
            //画图跟踪
            var evt = window.event || e;
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
            var drawRectDiv = document.getElementById('drawRect');
            this.rectLeft = (this.startX - evt.clientX - scrollLeft > 0 ? evt.clientX + scrollLeft : this.startX) + 'px';
            this.rectTop = (this.startY - evt.clientY - scrollTop > 0 ? evt.clientY + scrollTop : this.startY) + 'px';
            this.rectHeight = Math.abs(this.startY - evt.clientY - scrollTop) + 'px';
            this.rectWidth = Math.abs(this.startX - evt.clientX - scrollLeft) + 'px';
            drawRectDiv.style.left = this.rectLeft;
            drawRectDiv.style.top = this.rectTop;
            drawRectDiv.style.width = this.rectWidth;
            drawRectDiv.style.height = this.rectHeight;
        }
    }

    addDrawRectEventListener() {
        //添加listener
        var overlay = document.getElementById('drawRectOverlay');
        if(overlay) {
            overlay.style.cursor = 'crosshair';
            overlay.addEventListener('mousedown', this.onMouseDown);
            overlay.addEventListener('mouseup', this.onMouseUp);
            overlay.addEventListener('mousemove', this.onMouseMove);
        }
    }

    removeDrawRectEventListener() {
        //移除listener
        var overlay = document.getElementById('drawRectOverlay');
        if(overlay) {
            overlay.style.cursor = 'auto';
            overlay.removeEventListener('mousedown', this.onMouseDown);
            overlay.removeEventListener('mouseup', this.onMouseUp);
            overlay.removeEventListener('mousemove', this.onMouseMove);
        }
    }
}

module.exports = DrawRect;