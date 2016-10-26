/**
 * Created by vxplo on 2016/9/27.
 */
import React from 'react';
import { Form, Input, InputNumber, Slider, Switch, Collapse,Select,Dropdown,Menu} from 'antd';
const MenuItem = Menu.Item;
let count=0;

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
       this.oldVal=null;
    }
    componentDidMount() {

    }
    componentWillReceiveProps(nextProps){
        this.setState({
            value:nextProps.value,
            item:nextProps.item,
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
    inputFocus(e){
        this.oldVal=e.target.value;
    }
     inputBlur(e){
         let newVal=e.target.value;
         let arr =newVal.split(',');
         var reg = /^[-]?[0-9]+$/;

         if(newVal!=this.oldVal && arr.length==2 && reg.test(arr[0]) && reg.test(arr[1])){
             this.state.dropDownOnChange({key:e.target.value},this.state.item);
         }else{
             this.oldVal=null;
         }
     }
    render() {
        return (
            <Dropdown   overlay={this.props.overlay}   trigger={['click']} >
                <div >
                    <input  className="origin_dropdown"  value={this.state.value} onFocus={this.inputFocus.bind(this)} onBlur={this.inputBlur.bind(this)} onChange={this.inputChange.bind(this)} />
                    <span />
                </div>
            </Dropdown>
        );
    }
}


class ConInputNumber extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count:count++
        };
        this.T=null;
        this.TOut=null;
        this.fatherObj=null;
        this.downBtn=null;
        this.upBtn=null;
        this.btnWraper=null;
        this.inputObj=null;
       this.onMousedown=this.onMousedown.bind(this);
       this.onMouseUp=this.onMouseUp.bind(this);


    }
    componentDidMount() {

        this.fatherObj=document.getElementsByClassName('conInputNumber'+this.state.count)[0];
        this.downBtn =this.fatherObj.getElementsByClassName('ant-input-number-handler-down')[0];
        this.upBtn =this.fatherObj.getElementsByClassName('ant-input-number-handler-up')[0];
        this.btnWraper= this.fatherObj.getElementsByClassName('ant-input-number-handler-wrap')[0];
        this.inputObj=this.fatherObj.getElementsByClassName('ant-input-number-input')[0];



        this.downBtn .addEventListener('mousedown',this.onMousedown);
        this.upBtn .addEventListener('mousedown',this.onMousedown);
        this.downBtn .addEventListener('mouseout',this.onMouseUp);
        this.upBtn .addEventListener('mouseout',this.onMouseUp);
        document.addEventListener('mouseup',this.onMouseUp);
    }
    componentWillUnmount() {

        this.downBtn.removeEventListener('mousedown',this.onMousedown);
        this.upBtn.removeEventListener('mousedown',this.onMousedown);
        this.downBtn .removeEventListener('mouseout',this.onMouseUp);
        this.upBtn .removeEventListener('mouseout',this.onMouseUp);
        document.removeEventListener('mouseup',this.onMouseUp);
    }
    onMousedown(e){
        let type= e.currentTarget.classList[1]=='ant-input-number-handler-down'?'downBtn':'upBtn';
        this.TOut = setTimeout(function () {
            this.T =setInterval(function () {
                this[type].click();
            }.bind(this),100);
        }.bind(this),300);

    }
    onMouseUp(){
        clearTimeout(this.TOut);
        clearInterval(this.T);
    }

    componentWillReceiveProps(nextProps){

    }


    render() {
        return (
            <div className={'conInputNumber'+this.state.count}> <InputNumber  {...this.props}   /></div>
        );
    }
}



export {SwitchMore,DropDownInput,ConInputNumber};