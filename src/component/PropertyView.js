/**
 * 属性面板
 */

import React from 'react';
import ReactDOM from 'react-dom';

import { Form, Input, InputNumber, Slider, Switch, Collapse,Select } from 'antd';
const Panel = Collapse.Panel;
import cls from 'classnames';

import WidgetStore from '../stores/WidgetStore';
import WidgetActions from '../actions/WidgetActions';

import {propertyType, propertyMap} from './PropertyMap';

require("jscolor/jscolor");


class PropertyView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {fields: null};
        this.selectNode = null;
        this.currentPage = null;
        this.defaultWidth = null;
        this.defaultData = {
            width: null,
            height: null
        };
        this.originPos={
            x:null,
            y:null
        };
    }

    setColor(value){
        let oInput =document.getElementsByClassName('color-input')[0];
        if(value){

        }else{
            oInput.value='transparent';
            oInput.jscolor.onFineChange();
        }
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

            case propertyType.Boolean:

                return <Switch   {...defaultProp} />;

            case propertyType.Select:
                return  <Select   {...defaultProp}  >
                    {defaultProp.options}
                </Select>;

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
                    v = parseFloat(value);
                    break;
                case propertyType.Number:
                    v = parseFloat(value);
                    break;
                case propertyType.Integer:
                    v = parseInt(value);
                    break;
                case propertyType.Float:
                    if(this.selectNode.props.isLock){
                        if('scaleX'== prop.name) {
                            //获取scaleY的值
                            let h  =parseFloat(value)*(this.selectNode.node.height/this.selectNode.node.width)/this.selectNode.node.defaultData.height;
                           //获取scaleX的值
                            let w =parseFloat(value) /this.selectNode.node.defaultData.width;


                            //调用更新
                            const obj = {};

                            obj[prop.name] =w;
                            obj['scaleY']=h;
                            this.onStatusChange({updateProperties: obj});

                            WidgetActions['updateProperties'](obj, false, true);

                        }else if('scaleY'== prop.name){
                            //获取scaleX的值
                             let w  =parseFloat(value)*(this.selectNode.node.width/this.selectNode.node.height)/this.selectNode.node.defaultData.width;
                            //获取scaleY的值
                            let h =parseFloat(value) /this.selectNode.node.defaultData.height;

                            //调用更新
                            const obj = {};

                            obj[prop.name] =h;
                            obj['scaleX']=w;
                            this.onStatusChange({updateProperties: obj});
                            WidgetActions['updateProperties'](obj, false, true);
                        }
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

                      const obj = {};

                       prop.name='originX';
                       obj[prop.name] = parseFloat(arr[0]);
                      this.onStatusChange({updateProperties: obj});
                      WidgetActions['updateProperties'](obj, false, true);//reflux模式,調用actions

                      prop.name='originY';
                      obj[prop.name] = parseFloat(arr[1]);
                      this.onStatusChange({updateProperties: obj});
                      WidgetActions['updateProperties'](obj, false, true);//reflux模式,調用actions

                      prop.name='originPos';

                       bTag=false;

                  }else{
                      v = parseInt(value);
                  }

                    break;
                case propertyType.Boolean:
                    v = (value === prop.default) ? null : value;
                    break;
                case propertyType.Color:



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
           WidgetActions['updateProperties'](obj, false, true);//reflux模式,調用actions
       }
    }



    onChangePropDom(item, value) {
        if(item.type === propertyType.String || item.type === propertyType.Text ){
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
   //获取下拉框默认值
    getSelectDefault(originPos,options){
        for(var i in options){
             if(options[i][0]==originPos.x && options[i][1]==originPos.y  ){
                 return i;
             }
        }
    }
    //锁定
    antLock(){
        this.selectNode.props.isLock=!this.selectNode.props.isLock;
        let  oLock=  document.getElementsByClassName('ant-lock')[0];
       if(this.selectNode.props.isLock){
           oLock.classList.add('ant-lock-checked');
       }else{
           oLock.classList.remove('ant-lock-checked');
       }
    }

    getFields() {
        let node = this.selectNode;//当前舞台选中的对象

        if (!node)
            return null;

        if( node.props.isLock ===undefined){ node.props.isLock=false;}

        let className = node.className;
        if (className.charAt(0) == '_')
            className = 'class';

        if (!propertyMap[className])
            return null;

        //暂未被使用
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 }
        };

        const groups = {};



        const getInput = (item, index) => {
             //item,propertyMap中的元素;node,当前选中的属性面板,node.node中存储了属性值,props中存储了用于回填的值

            //设置默认值
            let defaultValue;

            if (item.readOnly ) {
                defaultValue = node.node[item.name];
            }else if(item.type==propertyType.Float) {
                let str = item.name == 'scaleX' ? 'width' : 'height'
                defaultValue = node.node[str];
                if (!this.selectNode.node.defaultData) { this.selectNode.node.defaultData={};}//只执行一次
                if(!this.selectNode.node.defaultData[str]){this.selectNode.node.defaultData[str]=defaultValue}
            }else if(item.type==propertyType.Color){
               if( item.name == 'color' &&  !node.props.color){ //只执行一次
                   node.props.color='#FFFFFF';
               }
                if(node.props[item.name+'_originColor']){
                    defaultValue =node.props[item.name+'_originColor'];
                }else{
                    defaultValue =node.props[item.name];
                }




            } else {
                if (node.props[item.name] === undefined){
                    defaultValue = (item.type === propertyType.Boolean || item.type === propertyType.Percentage) ? item.default : '';
                }  else{
                    defaultValue = node.props[item.name];
                    if(item.name == 'originX'){
                        this.originPos.x=defaultValue;
                    }else if(item.name == 'originY'){
                        this.originPos.y=defaultValue;
                    }
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
              if(item.name=='originY' ||item.name=='originPos') {
                  defaultProp.defaultValue = this.getSelectDefault(this.originPos, item.options);
                  selectClassName='originIcon';
              }
                //拼接children元素
                defaultProp.options=[];
                for(var i in  item.options){
                    defaultProp.options.push(<Option  key={item.options[i]}><div className={selectClassName}></div>{i}</Option>);
                }
            }else if(item.type ==propertyType.Color){
                    defaultProp.defaultChecked=node.props[item.name+'_originColor']?false:true;
                    defaultProp.value = defaultValue;
            } else {
                defaultProp.value = defaultValue;
            }

            let groupName = item.group || 'basic';
            if (groups[groupName] === undefined)
                groups[groupName] = [];

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

        propertyMap[className].forEach((item, index) => {
            if (item.isProperty)
                getInput(item, index);
        });

        return Object.keys(groups).map((name,index)=> 
                <Form horizontal key={index}>
                    {groups[name].map((input, i) => input)}
                </Form>);
    }

    onStatusChange(widget) {

        if (widget.selectWidget !== undefined){
            //加载后被调用,数据的更改激活change
            this.selectNode = widget.selectWidget;

            this.setState({fields: this.getFields()});
            let node = this.selectNode; //当前加载的对象

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
            if (className.charAt(0) == '_')
                className = 'class';

             propertyMap[className].map(item => {
                if (item.isProperty && obj[item.name] !== undefined) {
                    if ( obj[item.name]=== null) {
                        delete(selectNode.props[item.name]);
                        if (needRender)
                            selectNode.node[item.name] = item.default;
                    } else {
                        //用于回填
                        selectNode.props[item.name] = obj[item.name];
                        //用于更新
                        if (needRender)
                            selectNode.node[item.name] = item.name == 'alpha' ? obj[item.name] / 100 : obj[item.name];
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
            <div id='PropertyView'>
                <h1 id='PropertyViewHeader'>属性</h1>
                <div id='PropertyViewBody'>
                    {this.state.fields}
                </div>
            </div>
        );
    }
}

module.exports = PropertyView;
