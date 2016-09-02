import React from 'react';

class DesignView extends React.Component {

    constructor(props) {
        super(props);
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
        t = t - y / 10;
        this.refs.view.style.top = t+'px';
    }

    render() {
      return (
        <div className='f--hcc' 
            id='DesignView-Container'
            ref='container' onWheel={this.scroll}>
          <div id='canvas-dom' className="DesignView" ref='view'></div>
        </div>
      );
    }
}

module.exports = DesignView;
