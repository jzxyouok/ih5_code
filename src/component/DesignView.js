import React from 'react';

class DesignView extends React.Component {
    constructor(props) {
        super(props);
        this.state={

        };

        this.scroll = this.scroll.bind(this);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    scroll(event) {
        event.preventDefault();
        event.stopPropagation();
        //console.log(event);
        let y  = event.deltaY;
        let x  = event.deltaX;
        if(y===0 || y===-0) return;
        let top = window.getComputedStyle(this.refs.view,null).getPropertyValue("top");
        let t = parseFloat(top.replace(/(px)?/, ''));
        t -= y/8;
        this.refs.view.style.top = t+'px';
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
