/**
 * Created by vxplo on 2016/10/31.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import cls from 'classnames';
import { Form, Input, InputNumber, Slider, Switch, Collapse,Select,Dropdown,Menu} from 'antd';
const Option = Select.Option;
const Panel = Collapse.Panel;
const MenuItem = Menu.Item;
import { SwitchMore,DropDownInput ,ConInputNumber} from  './PropertyViewComponet';
import { FormulaInput } from './FormulaInputComponent';

import WidgetStore, {dataType} from '../../stores/WidgetStore';
import WidgetActions from '../../actions/WidgetActions';
import {propertyType} from '../tempMap';
import {chooseFile} from  '../../utils/upload';
require("jscolor/jscolor");
import TbCome from '../TbCome';

class PropertyViewSetUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            oKey:props.oKey,
            property:props.property
        };

        this.getResult =props.getResult;
        this.getComponent=this.getComponent.bind(this);
        this.getDefaultProp=this.getDefaultProp.bind(this);

    }
    componentDidMount() {

    }
    componentWillReceiveProps(nextProps){
       this.setState({
           oKey:nextProps.oKey,
           property:nextProps.property
       })
    }
    componentWillUnmount() {

    }

    getDefaultProp(item){
        //设置通用默认参数和事件
        let defaultProp = {
            size: 'small',
            placeholder: item.default,
            disabled: (item.readOnly !== undefined) || !this.props.enable,
            onChange:  this.onChangePropDom.bind(this, item)
        };
        let node = WidgetStore.getWidgetByKey(this.state.oKey);

        //console.log(node,'node');
        let defaultValue=node?node.node[item.name]:'';
        //defaultProp特殊性处理
        switch(item.type) {
            case propertyType.Select:
                defaultProp.options = [];
                //适配
                if (item.name == 'scaleType') {
                    defaultValue=item.default;
                    for (var i in  item.options) {
                        defaultProp.options.push(<Option key={item.options[i]} className='select-scaleType'>{i}</Option>);
                    }
                }
                break;
            case propertyType.Dropdown:
                //中心点
                if (item.name == 'originPos') {
                    defaultProp.item = item;
                    defaultValue = item.default;
                    let arr = [];
                    for (var i in  item.options) {
                        arr.push(<MenuItem key={item.options[i]}>
                            <div className='originIcon'></div>
                            {i}</MenuItem>);
                    }
                    defaultProp.overlay = <Menu className='dropDownMenu3' onClick={defaultProp.onChange}>{arr}</Menu>;
                }
                break;
            case propertyType.Percentage:
                defaultValue = defaultValue * 100;
                break;
            case propertyType.Integer:
                if(item.name=='header') {
                   let arr = defaultValue.split(',');
                    defaultValue =arr.length;
                }
                break;
            case propertyType.FormulaInput:
                defaultValue = {type: 1, value: defaultValue};
                break;
            default:
                break;
        }

        if(item.value !==undefined){
            defaultValue =item.value;
            //设置之后的特殊处理
             switch (item.type){
                 case  propertyType.Dropdown:
                     defaultValue = this.getSelectDefault(item.value,item.options);
                     break;
                 case propertyType.FormulaInput:
                     if((defaultValue&&!defaultValue.type) || !defaultValue) {
                         defaultValue = {type: 1, value: defaultValue};
                     }
                     break;
                 default:
                     break;
             }
        }
        defaultProp.value= defaultValue;
        return defaultProp;
    }

    onChangeProp(item, value) {
        let runTag=true;
        switch(item.type){
            case propertyType.Dropdown:
                if(item.name=='originPos'){
                    item.value=value.key;
                    this.getResult(item);
                    runTag=false;
                }
                break;
            case propertyType.Text:
            case propertyType.String:
                if(item.name=='value'){
                     if(value===undefined){
                         value='';
                     }
                }
                break;
            default:;
        }

        if(runTag){
            item.value=value;
            this.getResult(item);
        }
    }
    onChangePropDom(item, value) {
        if(item.type === propertyType.String || item.type === propertyType.Text ||item.type === propertyType.Color2){
            this.onChangeProp(item, (value && value.target.value !== '') ? value.target.value : undefined);
        }else if(item.type === propertyType.Color || item.type === propertyType.TbColor){
            this.onChangeProp(item,value.target.value);
        } else{
            this.onChangeProp(item,value);
        }
    }

    getComponent(){
        let item=this.state.property;
        let style = {};
        let type =item.type;
        let defaultProp =this.getDefaultProp(item);
        let defaultData =  defaultProp;

        switch (type) {
            case propertyType.Integer:
                if(defaultProp.tbCome == "tbS"){
                    delete defaultData.tbCome;
                    return <ConInputNumber  {...defaultData}/>;
                }
                else {
                    return <ConInputNumber {...defaultProp} />;
                }
            case propertyType.Float:
                return <ConInputNumber {...defaultProp}  />;

            case propertyType.Number:
                if(defaultProp.tbCome == "tbS"){
                    style['width'] = "58px";
                    style['height'] = "22px";
                    style['lineHeight'] = "22px";
                    delete defaultData.tbCome;
                    return <ConInputNumber  {...defaultData} style={style} />;
                }
                else {
                    return <ConInputNumber  step={0.1} {...defaultProp}  />;
                }
            case propertyType.Percentage:
                // <InputNumber step={1} max={100} min={0}  {...defaultProp}  className='slider-input' />
                //  <Slider    step={1}  max={100} min={0}   {...defaultProp}    className='slider-per' />
                return  <div>
                         <ConInputNumber  step={1} max={100} min={0}  {...defaultProp}  className='slider-input' />
                        </div>;
            case propertyType.Text:
                return <Input type="textarea" {...defaultProp} />;

            case propertyType.Color:
                // <Switch       {...defaultProp}      className='visible-switch ant-switch-small' />
                return <div>
                    <Input ref={(inputDom) => {
                        if (inputDom) {
                            var dom = ReactDOM.findDOMNode(inputDom).firstChild;
                            if (!dom.jscolor) {
                                dom.jscolor = new window.jscolor(dom, {hash:true, required:false});
                                dom.jscolor.onFineChange = defaultProp.onChange;
                                dom.jscolor.backgroundColor='#234e4b';

                            }
                        }
                    }} {...defaultProp}   className='color-input' />

                </div>;
            case propertyType.Color2:
                if(defaultProp.tbCome){
                    delete defaultData.tbCome;
                }
                return  <Input ref={(inputDom) => {
                    if (inputDom) {
                        var dom = ReactDOM.findDOMNode(inputDom).firstChild;
                        if (!dom.jscolor) {
                            dom.jscolor = new window.jscolor(dom, {hash:true, required:false});
                            dom.jscolor.onFineChange = defaultProp.onChange;
                            dom.jscolor.backgroundColor='#234e4b';

                        }
                    }
                }}  {...defaultData}   /> ;

            case propertyType.Boolean:
                return <Switch   {...defaultProp} />;
            case propertyType.Boolean2:
                return <SwitchMore   {...defaultProp} />;
            case propertyType.Select:
                if(defaultProp.tbCome == "tbF"){
                    style['width'] = "125px";
                    style['maxWidth'] = "125px";
                }
                return <div className={cls({"flex-1": defaultProp.tbCome == "tbF"})}>
                    <Select {...defaultProp} style={style}>
                        {defaultProp.options}
                    </Select>
                </div>;
            case propertyType.TbSelect:

                return  <div className="f--hlc">
                    <div className="flex-1">
                        <Select {...defaultProp}>
                            {defaultProp.options}
                        </Select>
                    </div>

                    <div style={{ width: "58px", marginLeft: "3px", position:"relative"}}>
                        <Input style={{height:"22px",padding:"0 7px"}} />
                        <span className="TbSelect-icon" />
                    </div>
                </div>;

            case propertyType.TbColor :
                return
                        <Input
                            ref={(inputDom) => {
                                if (inputDom) {
                                    var dom = ReactDOM.findDOMNode(inputDom).firstChild;
                                    if (!dom.jscolor) {
                                        dom.jscolor = new window.jscolor(dom, {hash:true, required:false});
                                        dom.jscolor.onFineChange = defaultProp.onChange;
                                        dom.jscolor.backgroundColor='#234e4b';
                                    }
                                }
                            }}
                            placeholder={defaultProp.placeholder}
                            style={{height:"22px",width:'142px',padding:"0 7px", position:"relative"}}
                            className='color-input' />

            case propertyType.TdLayout :
                return  <div className="f--hlc TdLayout">
                    <span className={cls({"active": defaultProp.placeholder.indexOf(1) >=0 })} />
                    <span className={cls({"active": defaultProp.placeholder.indexOf(2) >=0 })} />
                    <span className={cls({"active": defaultProp.placeholder.indexOf(3) >=0 })} />
                    <span className={cls({"active": defaultProp.placeholder.indexOf(4) >=0 })} />
                </div>;
            case propertyType.Dropdown:
                return  <DropDownInput {...defaultProp} />;
            case propertyType.FormulaInput:
                return <FormulaInput containerId={this.props.propertyId}
                                     minWidth="142px"
                                     objectList={this.props.objectList}
                                     onFocus={this.props.onFInputFocus}
                                     onBlur={this.props.onFInputBlur}
                                     {...defaultProp}/>;
            default:
                return <Input {...defaultProp} />;
        }
    }

    /********辅助方法区*********/
    //获取中心点下拉框默认值
    getSelectDefault(originPos,options){
        let arr =originPos.split(',');
        for(let i in options){
            if(options[i][0]==arr[0] && options[i][1]==arr[1]  ){
                return i;
            }
        }
        return originPos.x+','+originPos.y;
    }

    render() {
        return <div className='propertySet'>{this.getComponent()}</div>
    }
}

module.exports = PropertyViewSetUp;