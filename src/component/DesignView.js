import React from 'react';

class DesignView extends React.Component {
    constructor(props) {
        super(props);
        this.state={

        };

        this.scroll = this.scroll.bind(this);
        this.onKeyScroll = this.onKeyScroll.bind(this);
    }

    componentDidMount() {
        document.body.addEventListener('keyup', this.onKeyScroll);
    }

    componentWillUnmount() {
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
        let STEP = 16;
        //console.log(event);
        // left
        if(event.keyCode === 37 || event.which === 37) {
            let left = window.getComputedStyle(this.refs.view,null).getPropertyValue("left");
            let l = parseFloat(left.replace(/(px)?/, ''));
            l -= STEP;
            this.refs.view.style.left = l+'px';
            return;
        }
        if(event.keyCode === 39 || event.which === 39) {
            let left = window.getComputedStyle(this.refs.view,null).getPropertyValue("left");
            let l = parseFloat(left.replace(/(px)?/, ''));
            l += STEP;
            this.refs.view.style.left = l+'px';
            return;
        }
    }

    render() {
        return (
        <div className='f--hcc'
            id='DesignView-Container'
            ref='container'
            onWheel={this.scroll}>

            <div id='canvas-dom'
                className="DesignView"
                ref='view'
                style={{ 'transform' : 'scale('+  this.props.stageZoom / 100 +')' }}></div>
        </div>
        );
    }
}

module.exports = DesignView;
