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

import WidgetStore, {dataType} from '../../stores/WidgetStore';
import WidgetActions from '../../actions/WidgetActions';
import {propertyType, propertyMap} from '../PropertyMap';
import {chooseFile} from  '../../utils/upload';
require("jscolor/jscolor");
import TbCome from '../TbCome';

class PropertyViewSetUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            className:props.classType,
            key:props.okey
        };

        this.getComponent=this.getComponent.bind(this);
        this.getDefaultProp=this.getDefaultProp.bind(this);

    }
    componentDidMount() {

    }
    componentWillReceiveProps(nextProps){
       this.setState({
           className:nextProps.classType,
           key:nextProps.okey
       })
    }
    componentWillUnmount() {

    }

    getDefaultProp(item){
        //设置通用默认参数和事件
        let defaultProp = {
            size: 'small',
            placeholder: item.default,
            disabled: item.readOnly !== undefined,
            onChange:  this.onChangePropDom.bind(this, item)
        };
        let className =this.state.className;
        let node = WidgetStore.getWidgetByKey(this.state.key);
        let defaultValue=node.node[item.name];

        //单独设置默认参数
        if (item.type === propertyType.Boolean || item.type === propertyType.Boolean2) {
            defaultProp.checked = defaultValue;
            if(className=='table' && item.name == "showHeader"){
                if(!this.state.tbHeaderToggle !== defaultProp.checked){
                    this.setState({
                        tbHeaderToggle : !defaultProp.checked
                    })
                }
            }
        }else if(item.type ==propertyType.Dropdown ){
            defaultProp.value = defaultValue;
            defaultProp.item=item;
            let arr=[];
            for(var i in  item.options){
                arr.push(<MenuItem  key={item.options[i]}><div className='originIcon'></div>{i}</MenuItem>);
            }
            defaultProp.overlay =  <Menu className='dropDownMenu2' onClick={defaultProp.onChange}>{arr}</Menu>;

        }
        else if(item.type ==propertyType.Select || item.type ==propertyType.TbSelect ){
            let selectClassName='';
            defaultProp.options=[];
            defaultProp.value = defaultValue;
            if(item.name=='originY' ||item.name=='originPos') {
                selectClassName='originIcon';
            }
            else if(item.name=='fontFamily' || item.name=='headerFontFamily'){
                for(let i in this.fontList){
                    defaultProp.options.push(<Option  key={this.fontList[i].file}><div className={selectClassName}></div>{this.fontList[i].name}</Option>);
                }
            }
            else if(item.name=='font'){
                defaultProp.name=item.name;
                defaultProp.options.push(<Option  key={0}><div className={selectClassName}></div>上传字体</Option>);
                for(let i in this.fontList){
                    defaultProp.options.push(<Option  key={this.fontList[i].file}><div className={selectClassName}></div>{this.fontList[i].name}</Option>);
                }
            }
            else if(item.name=='type'){
                for(let i in  item.options){
                    selectClassName= (item.options[i]=='slideInUp' || item.options[i]== 'jello')? 'optionline':'';
                    defaultProp.options.push(<Option  key={item.options[i]} className={selectClassName}>{i}</Option>);
                }
            }
            if(defaultProp.options.length==0){
                for(var i in  item.options){
                    defaultProp.options.push(<Option  key={item.options[i]}><div className={selectClassName}></div>{i}</Option>);
                }
            }
            if(item.name=='chooseColumn'){
                defaultProp.options=[];
                let tbWidth;
                if(node.props['header'] == undefined) {
                    tbWidth = "自动";
                    defaultProp.options.push(<Option key={0}>全部</Option>);
                }
                else {
                    let header = node.props['header'].split(",");
                    let nodo = true;
                    if(this.state.tbWhichColumn == 0){
                        nodo = false
                    }
                    if(nodo){
                        let lineWidth = header[this.state.tbWhichColumn-1];
                        let index = lineWidth.indexOf(':');
                        if( index>=0){
                            tbWidth = parseInt(lineWidth.substring(index + 1));
                        }
                        else {
                            tbWidth = "自动";
                        }
                    }
                    else {
                        let lineWidth = header[0];
                        let index = lineWidth.indexOf(':');
                        if( index>=0){
                            tbWidth = parseInt(lineWidth.substring(index + 1));
                        }
                        else {
                            tbWidth = "自动";
                        }
                    }

                    for(let x =0; x<= header.length; x++){
                        let data;
                        if(x==0){
                            data = "全部";
                        }
                        else {
                            data = '第 ' + (x) + ' 列';
                        }
                        defaultProp.options.push(<Option key={x}>{ data } </Option>);
                    }
                }
                defaultProp.tbWidth = tbWidth;
            }
        }else if(item.type ==propertyType.Color||item.type ==propertyType.Color2){
            defaultProp.defaultChecked=node.props[item.name+'_originColor']?false:true;
            defaultProp.value = defaultValue;
        }else if(item.type === propertyType.TbColor){
            defaultProp.value = defaultValue;
            defaultProp.tbHeight = node.props['headerHeight'] ?  node.props['headerHeight']  : "自动";
        }else {
            defaultProp.value = defaultValue;
        }
        return defaultProp;
    }

    onChangeProp(item, value){
        let node = WidgetStore.getWidgetByKey(this.state.key);
         node.node[item.name]=value;

    }
    onChangePropDom(item, value) {
        if(item.type === propertyType.String || item.type === propertyType.Text ||item.type === propertyType.Color2){
            this.onChangeProp(item, (value && value.target.value !== '') ? value.target.value : undefined);
        }else if(item.type === propertyType.Color || item.type === propertyType.TbColor){
            if(typeof value == 'boolean'){
                let colorStr;
                if(value){
                    colorStr =this.selectNode.props[item.name+'_originColor'];
                    this.selectNode.props[item.name+'_originColor']=null;
                }else{
                    colorStr='transparent';
                    this.selectNode.props[item.name+'_originColor'] = this.selectNode.props[item.name];
                }
                this.onChangeProp(item,colorStr);
            }else{

                if(this.selectNode.props[item.name+'_originColor']){
                    this.selectNode.props[item.name+'_originColor']=value.target.value
                }else{
                    this.onChangeProp(item,value.target.value);
                }
            }
        } else{
            this.onChangeProp(item,value);
        }
    }

    getComponent(item){
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
                </div>;
            case propertyType.TbSelect:
                //console.log(defaultProp.tbWidth,this.state.tbLineWidth);
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



    render() {
        return  <div>
            {
                propertyMap[this.state.className].map((v,i)=>{
                    if(v.isProperty&& v.name !='id'){
                        return <div className="pp--list f--hlc" key={i}>
                            <div className="pp--name">{ v.showName }</div>
                            {this.getComponent(v)}
                        </div>
                    }
                })
            }
        </div>
    }
}

module.exports = PropertyViewSetUp;