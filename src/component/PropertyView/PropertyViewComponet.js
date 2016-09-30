/**
 * Created by vxplo on 2016/9/27.
 */
import React from 'react';

class SwitchMore extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.status=props.checked;
        this.onChange = props.onChange;
    }
    componentDidMount() {
        switch (this.status){
            case 0 :
                this.on('init');
                break;
            case 1 :
                this.mid('init');
                break;
            case 2 :
                this.off('init');
                break;
        }
    }
    componentWillUnmount() {

    }
    on(flag){
        this.refs.switchMoreUl.classList.remove('off');
        this.refs.switchMoreUl.classList.remove('mid');
        this.refs.switchMoreUl.classList.add('on');
        this.refs.switchMoreMidCrl.classList.remove('bg_gray');
        if(flag !== 'init') {
            this.onChange(true);
        }
    }

    mid(flag){
        this.refs.switchMoreUl.classList.remove('off');
        this.refs.switchMoreUl.classList.add('mid');
        this.refs.switchMoreUl.classList.remove('on');
        if(flag !== 'init') {
            this.onChange(null);
        }
    }

    off(flag){
        this.refs.switchMoreUl.classList.add('off');
        this.refs.switchMoreUl.classList.remove('mid');
        this.refs.switchMoreUl.classList.remove('on');
        this.refs.switchMoreMidCrl.classList.add('bg_gray');
        if(flag !== 'init') {
            this.onChange(false);
        }
    }
    render() {
        return (
             <div className='switchMore'>
                  <ul className='switchMore-ul' ref='switchMoreUl'>
                    <li className='switchMore-ul-on'  onClick={this.on.bind(this)}>ON</li>
                    <li className='switchMore-ul-mid'  onClick={this.mid.bind(this)}><div ref='switchMoreMidCrl'></div></li>
                    <li className='switchMore-ul-off' onClick={this.off.bind(this)}>OFF</li>
                  </ul>
             </div>
        );
    }
}
export {SwitchMore};