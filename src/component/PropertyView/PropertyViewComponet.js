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

    componentWillReceiveProps(nextProps){
        switch (nextProps.checked){
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
        this.refs.on.classList.add('cur');
        this.refs.mid.classList.remove('cur');
        this.refs.off.classList.remove('cur');

        if(flag !== 'init') {
            this.onChange(true);
        }
    }

    mid(flag){
        this.refs.on.classList.remove('cur');
        this.refs.mid.classList.add('cur');
        this.refs.off.classList.remove('cur');

        if(flag !== 'init') {
            this.onChange(null);
        }
    }

    off(flag){
        this.refs.on.classList.remove('cur');
        this.refs.mid.classList.remove('cur');
        this.refs.off.classList.add('cur');


        if(flag !== 'init') {
            this.onChange(false);
        }
    }
    render() {
        return (
             <div className='switchMore'>
                  <ul className='switchMore-ul' ref='switchMoreUl'>
                    <li className='switchMore-ul-on'  ref='on' onClick={this.on.bind(this)}>开</li>
                    <li className='switchMore-ul-mid cur'  ref='mid' onClick={this.mid.bind(this)}>自动</li>
                    <li className='switchMore-ul-off'  ref='off' onClick={this.off.bind(this)}>关</li>
                  </ul>
             </div>
        );
    }
}
export {SwitchMore};