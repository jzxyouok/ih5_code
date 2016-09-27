/**
 * 属性面板 zAl968uo
 */

import React from 'react';
import ReactDOM from 'react-dom';

import { Form, Input, InputNumber, Slider, Switch, Collapse,Select} from 'antd';
const Option = Select.Option;
const Panel = Collapse.Panel;
import cls from 'classnames';

import WidgetStore from '../stores/WidgetStore';
import WidgetActions from '../actions/WidgetActions';

import {propertyType, propertyMap} from './PropertyMap';
import {chooseFile} from  '../utils/upload';

require("jscolor/jscolor");


class PropertyView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {fields: null};
        this.selectNode = null;
        this.currentPage = null;
        this.fontList=[];
        this.textSizeObj=null;

        this.defaultData = {
            width: null,
            height: null
        };
        this.originPos={
            x:null,
            y:null
        };
    }

     //获取封装的form组件
     getInputBox(type, defaultProp) {
        switch (type) {
            case propertyType.Integer:
                return <InputNumber {...defaultProp} />;

            case propertyType.Float:
                return <InputNumber {...defaultProp} />;

            case propertyType.Number:
                return <InputNumber step={0.1} {...defaultProp} />;

            case propertyType.Percentage:
                return  <div>
                    <InputNumber step={1} max={100} min={0}  {...defaultProp}  className='slider-input' />
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
                return  <Input ref={(inputDom) => {
                if (inputDom) {
                    var dom = ReactDOM.findDOMNode(inputDom).firstChild;
                    if (!dom.jscolor) {
                        dom.jscolor = new window.jscolor(dom, {hash:true, required:false});
                        dom.jscolor.onFineChange = defaultProp.onChange;
                    }
                }
                }} {...defaultProp}  /> ;

            case propertyType.Boolean:

                return <Switch   {...defaultProp} />;

            case propertyType.Select:
                return <div>
                    <Select   {...defaultProp} >
                        {defaultProp.options}
                    </Select>
                    <div id={cls({'ant-progress':defaultProp.name=='font'})}><div></div></div>
                </div>;

            default:
                return <Input {...defaultProp} />;
        }
    }

    onChangeProp(prop, value) {
        let v;
        var bTag=true; //开关,控制执行

        if (value === undefined) {
            v = null;
        } else {
            switch (prop.type) {
                case propertyType.Percentage:
                    if(prop.name =='alpha'){
                        v = parseFloat(value)/100;
                    }else{
                        v = parseFloat(value);
                    }
                    break;
                case propertyType.Number:
                    if(prop.name='fontSize'){
                        const obj = {};
                        obj[prop.name] = parseInt(value);
                        obj.scaleY = obj.scaleX=1;
                        this.onStatusChange({updateProperties: obj});
                        WidgetActions['updateProperties'](obj, false, true);

                        bTag=false;
                    }else{
                        v = parseFloat(value);
                    }
                    break;
                case propertyType.Integer:
                    if(prop.name=='size'){
                        v = parseInt(value);
                        const obj = {};
                        obj[prop.name] = v;
                        obj.scaleY = obj.scaleX=1;
                        this.onStatusChange({updateProperties: obj});
                        WidgetActions['updateProperties'](obj, false, true);


                        bTag=false;
                    }else{
                        v = parseInt(value);
                    }
                    break;
                case propertyType.Float:
                    if(this.selectNode.props.isLock){
                        let h;
                        let w;
                        const obj = {};
                        if('scaleX'== prop.name) {
                              h  =parseFloat(value)*(this.selectNode.node.height/this.selectNode.node.width)/this.selectNode.node.defaultData.height;

                              w =parseFloat(value) /this.selectNode.node.defaultData.width;
                        }else if('scaleY'== prop.name) {
                            w = parseFloat(value) * (this.selectNode.node.width / this.selectNode.node.height) / this.selectNode.node.defaultData.width;

                            h = parseFloat(value) / this.selectNode.node.defaultData.height;
                        }
                        obj['scaleY'] =h;
                        obj['scaleX']=w;
                        this.onStatusChange({updateProperties: obj});
                        WidgetActions['updateProperties'](obj, false, true);
                        bTag=false;
                    }else{
                        if('scaleX'== prop.name) {
                            v =parseFloat(value) /this.selectNode.node.defaultData.width;
                        }else if('scaleY'== prop.name){
                            v = parseFloat(value)/this.selectNode.node.defaultData.height;
                        }
                    }
                    break;
                case propertyType.Select:
                  if(prop.name == 'originPos'){
                      //数组
                      let arr=value.split(',');
                      let x = parseFloat(arr[0]);
                      let y = parseFloat(arr[1]);
                      this.selectNode.props.originPosKey=this.getSelectDefault({x:x,y:y},prop.options);
                      const obj = {};
                       prop.name='originX';
                       obj[prop.name] =x;
                      this.onStatusChange({updateProperties: obj});

                      prop.name='originY';
                      obj[prop.name] = y;
                      this.onStatusChange({updateProperties: obj});
                      WidgetActions['updateProperties']({originX:x,originY:y}, false, true);
                      prop.name='originPos';
                       bTag=false;
                  }else if(prop.name == 'scaleType'){
                      this.selectNode.props.scaleTypeKey=this.getScaleTypeDefault(value,prop.options);
                      v = parseInt(value);
                  }else if(prop.name == 'fontFamily'){
                      this.selectNode.props.fontFamilyKey=this.getFontDefault(value);
                      v = value;

                  }else if(prop.name == 'font'){
                      if(value == 0){
                          let oProgress=document.getElementById('ant-progress');
                          chooseFile('font', true, function(){
                              //回调完成
                              oProgress.style.display='none';
                              //设置默认值

                              console.log(arguments[1],arguments[1].name,escape(arguments[1].name));

                              this.selectNode.props.fontKey=escape(arguments[1].name);


                              console.log(this.selectNode.props);
                              //更新属性面板
                              WidgetActions['render']();
                              this.setState({fields: this.getFields()});

                          }.bind(this),function(evt){
                              oProgress.style.display='block';
                              if (evt.lengthComputable) {
                                  var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                  oProgress.childNodes[0].innerHTML= '上传中 '+percentComplete+'%';
                                  oProgress.childNodes[0].style.width=percentComplete+'%';
                              }else {
                                  console.log('failed');
                              }
                          });
                          bTag=false;
                      }else{
                          this.selectNode.props.fontKey=this.getFontDefault(value);
                          v = value;
                      }
                  } else{
                      v = parseInt(value);
                  }
                    break;
                case propertyType.Boolean:
                    v =value;
                    break;
                default:
                    v = value;
            }
        }

       if(bTag){
           const obj = {};
           obj[prop.name] = v;
           this.onStatusChange({updateProperties: obj});
           WidgetActions['updateProperties'](obj, false, true);
       }
    }

    onChangePropDom(item, value) {
        if(item.type === propertyType.String || item.type === propertyType.Text ||item.type === propertyType.Color2){
            this.onChangeProp(item, (value && value.target.value !== '') ? value.target.value : undefined);
        }else if(item.type === propertyType.Color){
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

    getScaleTypeDefault(value ,options){
        for(let i in options){
            if(value == options[i]){
                return i;
            }
        }
    }
    getFontDefault(value){
        for(let i in this.fontList){
            if(value == this.fontList[i].file){
                return  this.fontList[i].name;
            }
        }
    }
   //获取下拉框默认值
    getSelectDefault(originPos,options){
        for(let i in options){
             if(options[i][0]==originPos.x && options[i][1]==originPos.y  ){
                 return i;
             }
        }
    }
    //锁定
    antLock(){
        if(this.selectNode.node.class != 'qrcode'){
            this.selectNode.props.isLock=!this.selectNode.props.isLock;
            let  oLock=  document.getElementsByClassName('ant-lock')[0];
            if(this.selectNode.props.isLock){
                oLock.classList.add('ant-lock-checked');
                let k =this.selectNode.props.scaleX;
                //设定原始宽高比
                // WidgetActions['updateProperties']({scaleX:1,scaleY:1}, false, false);
                WidgetActions['updateProperties']({scaleX:k,scaleY:k}, false, false);
            }else{
                oLock.classList.remove('ant-lock-checked');
            }
        }
    }

    getFields() {
        let node = this.selectNode;

        if (!node)  return null;

        if( node.props.isLock ===undefined){
            node.props.isLock =( node.node.class=='qrcode' ||  node.node.class=='image'||  node.node.class=='bitmaptext'||  node.node.class=='imagelist') ? true:false;
        }


        let className = node.className.charAt(0) == '_'?'class':node.className;
        if (!propertyMap[className])    return null;

        const groups = {};

        const getInput = (item, index) => {

            //设置默认值,用于展示
            let defaultValue;
            if (item.readOnly ) {
                defaultValue = node.node[item.name];
            }else if(item.type==propertyType.Float) {
                let str = item.name == 'scaleX' ? 'width' : 'height'

                defaultValue=(node.node.class=='bitmaptext' && this.textSizeObj)?this.textSizeObj[str]: node.node[str];

                this.textSizeObj =null;

                if (!this.selectNode.node.defaultData) { this.selectNode.node.defaultData={}; }//只执行一次

                if(!this.selectNode.node.defaultData[str]) {     this.selectNode.node.defaultData[str] = defaultValue   }//设置初始宽高,便于计算放大缩小的系数

            }else if(item.type==propertyType.Color || item.type==propertyType.Color2){
               if( item.name == 'color' &&  !node.props.color){ //只执行一次
                   node.props.color='#FFFFFF';
               }
                if(node.props[item.name+'_originColor']){  //舞台颜色隐藏后保存的颜色
                    defaultValue =node.props[item.name+'_originColor'];
                }else{
                    defaultValue =node.props[item.name];
                }
            } else if(item.type==propertyType.Select ){
                defaultValue = item.default;
                if(node.props.originPosKey && (item.name== 'originX' || item.name== 'originY' || item.name== 'originPos')) { //当originY时才会激活,而不是originPos
                    defaultValue = node.props.originPosKey;
                }else if(item.name=='scaleType' && node.props.scaleTypeKey){
                    defaultValue = node.props.scaleTypeKey;
                }else if( item.name=='font' && node.props.fontKey){
                    defaultValue = node.props.fontKey;
                }else if( item.name=='fontFamily'  && node.props.fontFamilyKey){
                    defaultValue = node.props.fontFamily;
                }
            } else  if (node.props[item.name] === undefined){
                if(item.type === propertyType.Boolean ){
                    defaultValue = item.default
                }else if(item.type === propertyType.Percentage && item.name=='alpha'){
                    defaultValue = item.default*100;
                }else{
                    defaultValue='';
                }
            } else {
                defaultValue = node.props[item.name];
                if (item.name == 'alpha') {
                    defaultValue = defaultValue * 100;
                }
            }

            //设置通用默认参数和事件
            const defaultProp = {
                size: 'small',
                placeholder: item.default,
                disabled: item.readOnly !== undefined,
                onChange:  this.onChangePropDom.bind(this, item)
            };

            //单独设置默认参数
            if (item.type === propertyType.Boolean) {
                defaultProp.checked = defaultValue;

            }else if(item.type ==propertyType.Select ){
              let selectClassName='';
                defaultProp.options=[];
                defaultProp.value = defaultValue;
              if(item.name=='originY' ||item.name=='originPos') {
                  selectClassName='originIcon';

              }else if(item.name=='fontFamily'){
                  for(let i in this.fontList){
                      defaultProp.options.push(<Option  key={this.fontList[i].file}><div className={selectClassName}></div>{this.fontList[i].name}</Option>);
                  }
              }else if(item.name=='font'){
                  defaultProp.name=item.name;
                  defaultProp.options.push(<Option  key={0}><div className={selectClassName}></div>上传字体</Option>);
                  for(let i in this.fontList){
                      defaultProp.options.push(<Option  key={this.fontList[i].file}><div className={selectClassName}></div>{this.fontList[i].name}</Option>);
                  }
              }
                if(defaultProp.options.length==0){
                    for(var i in  item.options){
                        defaultProp.options.push(<Option  key={item.options[i]}><div className={selectClassName}></div>{i}</Option>);
                    }
                }
            }else if(item.type ==propertyType.Color){
                    defaultProp.defaultChecked=node.props[item.name+'_originColor']?false:true;
                    defaultProp.value = defaultValue;
            } else {
                defaultProp.value = defaultValue;
            }



            let groupName = item.group || 'basic';
            if (groups[groupName] === undefined)   groups[groupName] = [];

            //设置布局结构和图标
            let hasTwin = ['x','y','w','h','rotationImgTag','originPosImgTag','shapeW','shapeH','scaleX','scaleY'].indexOf(item.showName) >= 0;//左右结构显示
            let hasPx=['x','y','w','h'].indexOf(item.showName)>=0; //判断input中是否添加px单位
            let hasDegree =['rotationImgTag'].indexOf(item.showName)>=0; //判断input中是否添加°单位
            let hasLock=item.showLock==true; //判断是否在元素前添加锁图标

           if(!item.showName){item.showName=item.name;}//当showName不存在时,用name作为showName

            //拼接图标样式
            let htmlStr;
            if(item.imgClassName){
                htmlStr=<label><div className={item.imgClassName}></div></label>
            }else{
                htmlStr= hasLock ?<label><div className={cls('ant-lock',{'ant-lock-checked':node.props.isLock})} onClick={this.antLock.bind(this)}></div>{item.showName}</label>:<label>{item.showName}</label>
            }

            groups[groupName].push(
                <div key={item.name}
                    className={cls('f--hlc','ant-row','ant-form-item',{'ant-form-half': hasTwin}, {'ant-form-full': !hasTwin})}>
                    <div className='ant-col-l ant-form-item-label'>{htmlStr}</div>
                    <div className='ant-col-r'>
                        <div className= {cls('ant-form-item-control', {'ant-input-degree':hasDegree}, {'ant-input-px': hasPx})}>
                        {this.getInputBox(item.type, defaultProp, item.readOnly !== undefined)}
                        </div>
                    </div>
                </div>
            );
        };


        const saveArr = []; //给部分属性排序用
        propertyMap[className].forEach((item, index) => {
            if (item.isProperty) {
                if(item.name=='visible' || item.name=='initVisible' ){
                    saveArr.push(item);
                }else{
                    if((className == 'timer' || className == 'container') && ( item.name=='scaleX' ||  item.name=='scaleY')){
                        ;
                    }else{
                        getInput(item, index);
                    }
                }
            }
        });
        saveArr.map(item=>{
            getInput(item);
        });

        return Object.keys(groups).map((name,index)=> 
                <Form horizontal key={index} className={'form_'+name}>
                    {groups[name].map((input, i) => input)}
                </Form>);
    }

    onStatusChange(widget) {

        if(widget.fontListObj){
           this.fontList =  widget.fontListObj.fontList;
        }

        if(widget.imageTextSizeObj){
           this.textSizeObj = widget.imageTextSizeObj;

            WidgetActions['render']();
            this.setState({fields: this.getFields()});
        }

        if (widget.selectWidget !== undefined){

            this.selectNode = widget.selectWidget;

            this.setState({fields: this.getFields()});
            let node = this.selectNode;

            while (node != null) {
                if (node.className == 'page') {
                    if (node != this.currentPage) {
                        this.currentPage = node;
                        node.parent.node['gotoPage'](node.node);
                    }
                    break;
                }
                node = node.parent; //node指向当前对象的父级对象
            }
        } else if (widget.updateProperties !== undefined && widget.skipProperty === undefined) {

            let needRender = (widget.skipRender === undefined);

            let selectNode = this.selectNode;
            let obj = widget.updateProperties;
            let className = selectNode.className;
            if (className.charAt(0) == '_')  className = 'class';

            propertyMap[className].map(item => {
                if (item.isProperty && obj[item.name] !== undefined) {
                    if (obj[item.name] === null) {
                        delete(selectNode.props[item.name]);
                        if (needRender)
                            selectNode.node[item.name] = undefined;
                    } else {
                        //用于回填
                        selectNode.props[item.name] = obj[item.name];
                        //用于更新
                        if (needRender){
                            selectNode.node[item.name] = obj[item.name];
                        }
                    }
                }
            });

            if (needRender)
                WidgetActions['render']();
                this.setState({fields: this.getFields()});
        }
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        return (
            <div id='PropertyView' style={{ left : this.props.expanded? '64px':'36px'}} className={cls({'hidden':this.props.isHidden})}>
                <h1 id='PropertyViewHeader'>属性</h1>
                <div id='PropertyViewBody'>
                    {this.state.fields}
                </div>
            </div>
        );
    }
}

module.exports = PropertyView;
