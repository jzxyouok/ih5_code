import React from 'react';

import WidgetActions from '../actions/WidgetActions';
import WidgetStore from '../stores/WidgetStore';

class DesignView extends React.Component {
    constructor(props) {
        super(props);
        this.state={

        };

        this.scroll = this.scroll.bind(this);
        this.onKeyScroll = this.onKeyScroll.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        //console.log(widget);
        if(widget.selectWidget){
            if(widget.selectWidget.className == "root"){
                document.body.addEventListener('keyup', this.onKeyScroll);
            }
            else {
                document.body.removeEventListener('keyup', this.onKeyScroll);
            }
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
        //console.log(event);

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
        console.log('aaaaa');
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
               <div className='h_ruler'></div>
               <div className='v_ruler'></div>
            </div>
           </div>
        </div>
        );
    }
}

module.exports = DesignView;
