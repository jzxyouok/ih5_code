/**
 * Created by vxplo on 2016/10/31.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Form, Input, InputNumber, Slider, Switch, Collapse,Select,Dropdown,Menu} from 'antd';
const Option = Select.Option;
const Panel = Collapse.Panel;
const MenuItem = Menu.Item;

import cls from 'classnames';
import { SwitchMore,DropDownInput ,ConInputNumber} from  './PropertyViewComponet';
import WidgetStore, {dataType} from '../../stores/WidgetStore';
import WidgetActions from '../../actions/WidgetActions';
import {propertyType, propertyMap} from '../PropertyMap';
import {chooseFile} from  '../../utils/upload';
require("jscolor/jscolor");

import TbCome from '../TbCome';

//获取组件
function getComponent(type,defaultProp) {
    let style = {};
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
            return  <div>
                <ConInputNumber  step={1} max={100} min={0}  {...defaultProp}  className='slider-input' />
                <Slider    step={1}  max={100} min={0}   {...defaultProp}    className='slider-per' />
            </div>;

        case propertyType.Text:
            return <Input type="textarea" {...defaultProp} />;

        case propertyType.Color:
            return <div>
                <Input ref={(inputDom) => {
                    if (inputDom) {
                        var dom = ReactDOM.findDOMNode(inputDom).firstChild;
                        if (!dom.jscolor) {
                            dom.jscolor = new window.jscolor(dom, {hash:true, required:false});
                            dom.jscolor.onFineChange = defaultProp.onChange;
                        }
                    }
                }} {...defaultProp}   className='color-input' />
                <Switch       {...defaultProp}      className='visible-switch ant-switch-small' />
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
                <div id={cls({'ant-progress':defaultProp.name=='font'})}>
                    <div className='ant-progress-bar'></div>
                    <div className='ant-progress-txt'>上传 10%</div>
                </div>
            </div>;
        case propertyType.TbSelect:
            return  <div className="f--hlc">
                <div className="flex-1">
                    <Select {...defaultProp}>
                        {defaultProp.options}
                    </Select>
                </div>

                <div style={{ width: "58px", marginLeft: "3px", position:"relative"}}>
                    <Input value={ this.state.tbLineWidth }
                           onChange={ this.tbLineWidthInput.bind(this) }
                           onBlur={ this.tbLineWidth.bind(this) }
                           style={{height:"22px",padding:"0 7px"}} />
                    <span className="TbSelect-icon" />
                </div>
            </div>;

        case propertyType.TbColor :
            return  <div className="f--hlc">
                <div className="flex-1">
                    <Input
                        ref={(inputDom) => {
                            if (inputDom) {
                                var dom = ReactDOM.findDOMNode(inputDom).firstChild;
                                if (!dom.jscolor) {
                                    dom.jscolor = new window.jscolor(dom, {hash:true, required:false});
                                    dom.jscolor.onFineChange = defaultProp.onChange;
                                }
                            }
                        }}
                        placeholder={defaultProp.placeholder}
                        style={{height:"22px",padding:"0 7px", position:"relative"}}
                        className='color-input' />
                </div>

                <div style={{ width: "58px", marginLeft: "3px",height:"22px" }}>
                    <Input placeholder={ defaultProp.tbHeight }
                           onChange={ this.tbHeadHeightInput.bind(this) }
                           onBlur={ this.tbHeadHeight.bind(this) }
                           style={{height:"22px",padding:"0 7px"}} />
                    <span className="TbColor-icon" />
                </div>
            </div>;
        case propertyType.TdLayout :
            return  <div className="f--hlc TdLayout">
                <span className={cls({"active": defaultProp.placeholder.indexOf(1) >=0 })} />
                <span className={cls({"active": defaultProp.placeholder.indexOf(2) >=0 })} />
                <span className={cls({"active": defaultProp.placeholder.indexOf(3) >=0 })} />
                <span className={cls({"active": defaultProp.placeholder.indexOf(4) >=0 })} />
            </div>;
        case propertyType.Dropdown:
            return  <DropDownInput {...defaultProp} />;
        default:
            return <Input {...defaultProp} />;
    }
}

//获取props
function getDefaultProps(item){
    //设置通用默认参数和事件
    let defaultProp = {
        size: 'small',
        placeholder: item.default,
        disabled: item.readOnly !== undefined,
        onChange:onChangePropDom(this, item)
    };
    defaultProp.value ='123';
    return  defaultProp;
}

//获取onChange
function onChangePropDom(type) {
    let value = null;
    switch (type) {
        case propertyType.String:
        case propertyType.color2:
            value = e.target.value;
            break;
        case propertyType.Integer:
        case propertyType.Float:
        case propertyType.Boolean2:
        case propertyType.Number:
        case propertyType.FormulaInput:
            value = e;
            break;
        case propertyType.Function:
            break;
        default:
            break;
    }
    return value;
}


//获取属性面板
function getPropertyView(className) {

}

export {getPropertyView};