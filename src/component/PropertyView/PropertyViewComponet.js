/**
 * Created by vxplo on 2016/9/27.
 */
import React from 'react';
import { Form, Input, InputNumber, Slider, Switch, Collapse,Select,Dropdown,Menu} from 'antd';
const MenuItem = Menu.Item;

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
                    <li className='switchMore-ul-mid cur'  ref='mid' onClick={this.mid.bind(this)}>自动</li>
                    <li className='switchMore-ul-on'  ref='on' onClick={this.on.bind(this)}>开</li>
                    <li className='switchMore-ul-off'  ref='off' onClick={this.off.bind(this)}>关</li>
                  </ul>
             </div>
        );
    }
}

class DropDownInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value:props.value,
            item:props.item,
            dropDownOnChange:props.onChange
        };
        console.log(props);
    }
    componentDidMount() {

    }
    componentWillReceiveProps(nextProps){
        this.setState({
            value:nextProps.value,
            item:props.item,
            dropDownOnChange:nextProps.onChange
        });
    }

    componentWillUnmount() {

    }
    inputChange(e){
        this.setState({
            value:e.target.value
        })
    }
     inputBlur(e){
         let arr =e.target.value.split(',');
         if(arr.length==2){
             this.state.dropDownOnChange({key:e.target.value},this.state.item);
         }
     }
    render() {
        return (
            <Dropdown   overlay={this.props.overlay}   trigger={['click']} >
                <div >
                    <input  className="origin_dropdown"  value={this.state.value}  onBlur={this.inputBlur.bind(this)} onChange={this.inputChange.bind(this)} />
                    <span />
                </div>
            </Dropdown>
        );
    }
}
export {SwitchMore,DropDownInput};