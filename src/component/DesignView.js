import React from 'react';

class DesignView extends React.Component {

    componentDidMount() {
        this.refs.container.addEventListener('mousewheel', this.scroll.bind(this));
        this.refs.container.addEventListener('DOMMouseScroll', this.scroll.bind(this));
    }

    componentWillUnmount() {
        this.refs.container.removeEventListener('mousewheel', this.scroll.bind(this));
        this.refs.container.removeEventListener('DOMMouseScroll', this.scroll.bind(this));
    }

    scroll(event) {
        //console.log(event);
        let y  = event.deltaY;
        let x  = event.deltaX;
        if(y===0 || y===-0) return;
        let top = window.getComputedStyle(this.refs.view,null).getPropertyValue("top");
        let t = parseFloat(top.replace(/(px)?/, ''));
        t = t - y/2;
        this.refs.view.style.top = t+'px';
    }

    render() {
      return (
        <div className='f--hcc' 
            id='DesignView-Container'
            ref='container'>
          <div id='canvas-dom' className="DesignView" ref='view'></div>
        </div>
      );
    }
}

module.exports = DesignView;
