//事件
import React from 'react';

import $class from 'classnames'

import Property from './Property'
import WidgetStore, {funcType, nodeType, nodeAction} from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'
import  {propertyMap} from '../PropertyMap'
import {eventTempData} from './tempData';

import { Menu, Dropdown, Icon ,InputNumber,Input,Select} from 'antd';
const MenuItem = Menu.Item;
const Option = Select.Option;

class Event extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            expanded: true,
            objName: [],//存储allWidget的className name type(intVal,strVal)
            toLong:false,
            eventList: this.props.eventList,
            selectWidget: this.props.widget,
            allWidgetsList: null,
            curChild:null,
            activeKey: this.props.activeKey,  //当前激活事件的key
            specialObject: ['counter', 'text', 'var'],
            //用于下拉框显示
            conOption: [],//每次点击后赋值
            logicalOption: ['and', 'or', 'not'],  //下拉选项
            judgeObjOption: [],

            judgeValOption: [],
            compareOption: ['=', '>', '<', '!=', '≥', '≤'],
            compareObjOption: [],
            compareValOption: []
        };



        this.curEventIndex = 0;
        this.curChildrenIndex = 0;

        this.oldVal=null;

        this.chooseEventBtn = this.chooseEventBtn.bind(this);
        this.expandedBtn = this.expandedBtn.bind(this);
        this.addEventBtn = this.addEventBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);

        this.getConditionOption = this.getConditionOption.bind(this);
        this.getJudgeObjOption =this.getJudgeObjOption.bind(this);
        this.getJudgeValOption=this.getJudgeValOption.bind(this);
        this.getCompareObjOption=this.getCompareObjOption.bind(this);
        this.getCompareValOption=this.getCompareValOption.bind(this);


        this.getJudgeValType =this.getJudgeValType.bind(this);
        this.getSpacJudgeValType=this.getSpacJudgeValType.bind(this);

        this.onEventEnable = this.onEventEnable.bind(this);
        this.onChildEnable = this.onChildEnable.bind(this);

        this.menuList =this.menuList.bind(this);
        this.setEventBoxWidth=this.setEventBoxWidth.bind(this);


        this.onSetFuncSpecificListProperty = this.onSetFuncSpecificListProperty.bind(this);
        this.getAntdComponent=this.getAntdComponent.bind(this);
        this.getShowNameByName=this.getShowNameByName.bind(this);
        this.getNameByCnName =this.getNameByCnName.bind(this);
        this.getObjNameByKey=this.getObjNameByKey.bind(this);
        this.content =this.content.bind(this);
    }

    componentWillReceiveProps(nextProps) {
       //解析部分
        nextProps.eventList.map((v,i)=>{
              v.className=nextProps.widget.className;
              if(!v.conFlag){
                  v.conFlag='触发条件';
              }
              v.children.map((item,index)=>{
                    if(item.judgeObjKey){
                        let obj1 =WidgetStore.getWidgetByKey(item.judgeObjKey);
                        if(obj1){
                            item.judgeObjFlag = obj1.props.name;
                        }
                    }
                    if(item.compareObjKey){
                        let obj2 =WidgetStore.getWidgetByKey(item.compareObjKey);
                        if(obj2){
                            item.compareObjFlag = obj2.props.name;
                        }
                    }
                    if(!item.judgeValFlag){
                        item.judgeValFlag='判断值';
                    }
                   if(!item.compareValFlag) {
                      item.compareValFlag = '比较值';
                    }
              });
        });

        this.setState({
            activeKey:nextProps.activeKey,
            eventList:nextProps.eventList
        },()=>{
            this.setEventBoxWidth();
        })
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());

        //获取当前事件对象的触发条件
        this.setEventBoxWidth();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        //触发更新目标对象列表
        if (widget.redrawEventTree) {
            if (this.props.wKey === this.props.activeKey) {
                this.forceUpdate();
            }
             this.setEventBoxWidth();
        }

        if(widget.allWidgets){
            let arr=[];
            let arr2=[];
            let eventList =this.state.eventList;
            widget.allWidgets.map((v,i)=>{
                arr.push([v.className,v.props.name,v.type]);
                arr2.push({
                    name:v.props.name,
                    key:v.key
                });
            });


            //此处可设置对象关系,将对象的引用注入进来.
            this.setState({
                objName:arr,   //类名与命名
                allWidgetsList: widget.allWidgets,
                judgeObjOption:arr2,  //命名
                eventList:eventList
            });
        }

        if (widget.selectWidget) {
            this.setState({
                selectWidget: widget.selectWidget
            });
        }
        else if (widget.updateWidget){
            switch (widget.updateWidget.type) {
                case nodeType.func:
                    let eventList = this.state.eventList;
                    eventList.forEach(v=>{
                        v.specificList.forEach(s=>{
                            if(s.action&&s.action.type === funcType.customize){
                                let func = WidgetStore.getWidgetByKey(s.action.func);
                                if (widget.updateWidget.action===nodeAction.change
                                    &&func
                                    &&func.widget.key === widget.updateWidget.widget.widget.key) {
                                    let property = this.onSetFuncSpecificListProperty(s.action, func.params);
                                    s.action.property = property;
                                }
                            }
                        });
                    });
                    this.setState({
                        eventList:eventList
                    });
                    break;
                default:
                    break;
            }
        }
    }

    onSetFuncSpecificListProperty(action, params) {
        //params
        let newProperty = null;
        if(params&&params.length>0){
            newProperty = [];
            params.forEach(p =>{
                if(p.name&&p.type){
                    let index = -1;
                    if(action.property){
                        action.property.forEach((i,ind) =>{
                            if(i.name === p.name){
                                index = ind;
                                newProperty.push(i);
                            }
                        });
                    }
                    if(index === -1) {
                        newProperty.push({'name':p.name, 'showName':p.name, 'value':null, 'type':p.type.type});
                    }
                }
            });
            if(newProperty.length==0){
                newProperty = null;
            }
        }
        return newProperty;
    }

    getJudgeValType(val){
        let propArr =this.state.curChild.propArr;
        let saveVal=null;
        propArr.map((v,i)=>{
             if(v.name== val){
                 saveVal =  v.type;
             }
        });
        return saveVal;
    }

    getSpacJudgeValType(val){
        let saveVal=null;
        this.state.objName.map((v,i)=>{
            if(v[1]== val){
                saveVal =  v[2] ?v[2]:v[0];
            }
        });
        if(saveVal=='number'){
            saveVal=0;
        }else if(saveVal=='string'){
            saveVal=2;
        }else if(saveVal=='text'){
            saveVal=3;
        }else if(saveVal=='counter'){
            saveVal=0;
        }
        return saveVal;
    }

    chooseEventBtn(nid){
        this.props.chooseEventBtn(nid);
    }

    addEventBtn(e) {
        // e.stopPropagation();
        WidgetActions['addEvent']();
    }

    onEventEnable(event, e) {
        WidgetActions['enableEvent'](event);
    }

    onChildEnable(event, eventChild, e) {
        if(!event.enable){
            return;
        }
        WidgetActions['enableEventChildren'](eventChild);
    }

    getClassNameByobjName(name){
        let val=null;
        this.state.objName.map((v,i)=>{
            if(v[1]==name){
                val = v[0];
            }
        });
        return val;
    }

    delEvent(index){
            WidgetActions['delEvent'](this.state.eventList,index);
    }

    expandedBtn(expanded, event){
        event.stopPropagation();
        this.setState({
            expanded: expanded
        });
    }

    //获取触发条件
    getConditionOption(optionName,oCurChild){
        let aProps=[];
        let obj={}
        let className = this.state.selectWidget.className;
        propertyMap[className].map((item,index)=>{
            if(item.isEvent === true){
                aProps.push(item);
            }
        });
        obj[optionName] = aProps;
        return obj;
    }

    //获取判断对象
    getJudgeObjOption(optionName,oCurChild){
        let allWidgetsList =this.state.allWidgetsList;
        let aProps=[];
        let obj={}
        allWidgetsList.map((v,i)=>{
            aProps.push({
                showName:v.props.name,
                key:v.key
            });
        });
        obj[optionName] = aProps;
        return obj;
    }

    //获取判断对象的属性
    getJudgeValOption(optionName,curChild) {
        let aProps = [];
        let className=null;

        let judgeObjFlag =curChild.judgeObjFlag; //判断对象名字

        let allWidgetsList =this.state.allWidgetsList;

        allWidgetsList.map((v,i)=>{
             if(v.props.name == judgeObjFlag){
                 className =v.className;
             }
        });


        let obj={};
        propertyMap[className].map((v, i)=> {
            if (v.isProperty && v.name != 'id') {
                if(v.showName=='W'){
                    aProps.push('宽度');
                }else if(v.showName=='H'){
                    aProps.push('高度');
                }else if(v.showName=='中心点'){
                    ;
                }else{
                      aProps.push(v.showName);
                }
            }
        });
        obj[optionName] =aProps;
        return obj;
    }

    //获取比较对象
    getCompareObjOption(optionName,oCurChild){
        let aProps=[];
        let obj={};
        let curChild=oCurChild;
        let judgeObjFlag= curChild.judgeObjFlag;
        let judgeObjVal=curChild.judgeValFlag;
        let allWidgetsList =this.state.allWidgetsList;
        let className=null;
        let type =null;

        allWidgetsList.map((v,i)=>{
            if(v.props.name == judgeObjFlag){
                className =v.className;
                if(className=='var'){
                    if(v.type=='number'){
                        type = 0;
                    }else if(v.type=='string'){
                        type = 2;
                    }
                }else if(className=='text' ){
                    type = 2;
                } else if(className=='counter'){
                    type = 0;
                }
            }
        });

       if(className &&  propertyMap[className]) {
           propertyMap[className].map((v, i)=> {
               if (v.isProperty && v.name == judgeObjVal) {
                   type = v.type;
               }
           });
       }

        allWidgetsList.map((v,i)=>{
                let tag=true;
                let classname= v.className;
                //特殊五类
                if(classname=='var'){
                    if(v.type=='number'){
                        v.type=[0,1,5];
                    }else if(v.type=='string'){
                        v.type=[2,3];
                    }
                    if(v.type.indexOf(type)>=0){
                        aProps.push({showName:v.props.name,key:v.key});
                    }
                }else if(classname=='text' ){
                    if([2,3].indexOf(type)>=0){
                        aProps.push({showName:v.props.name,key:v.key});
                    }
                } else if(classname=='counter'){
                    if([0,1].indexOf(type)>=0){
                        aProps.push({showName:v.props.name,key:v.key});
                    }
                } else{
                    propertyMap[classname].map((v1,i1)=>{
                        let typeArr= this.getTypeArr(v1.type);
                        if(tag && v1.isProperty && v1.name !='id' && typeArr.indexOf(type)>=0 ){  //需要兼容判断
                            aProps.push({showName:v.props.name,key:v.key});
                            tag=false;
                        }
                    });
                }
            });

        obj[optionName] =aProps;
        return obj;

    }

    //获取比较对象的属性
    getCompareValOption(optionName,oCurChild){
        let aProps=[];
        let obj={};
        let curChild=oCurChild;

        if(curChild){

            let judgeObjFlag= curChild.judgeObjFlag;
            let judgeObjVal=curChild.judgeValFlag;
            let judgeObjClassName=null;
            let allWidgetsList =this.state.allWidgetsList;
            let type =null;
            let compareObjFlag=curChild.compareObjFlag;
            let compareObjClassName=null;

            allWidgetsList.map((v,i)=>{
                if(v.props.name == judgeObjFlag){
                    judgeObjClassName =v.className;
                    if(judgeObjClassName=='var'){
                        if(v.type=='number'){
                            type = 0;
                        }else if(v.type=='string'){
                            type = 2;
                        }
                    }else if(judgeObjClassName=='text' ){
                        type = 2;
                    } else if(judgeObjClassName=='counter'){
                        type = 0;
                    }
                }
            });
            propertyMap[judgeObjClassName].map((v, i)=> {
                if (v.isProperty && v.name == judgeObjVal) {
                    type =v.type;
                }
            });
            allWidgetsList.map((v,i)=>{
                if(v.props.name == compareObjFlag){
                    compareObjClassName =v.className;
                }
            });

            propertyMap[compareObjClassName].map((v, i)=> {
                if(v.isProperty && v.name != 'id' && this.getTypeArr(v.type).indexOf(type)>=0){
                        if(v.showName=='W'){
                            aProps.push('宽度');
                        }else if(v.showName=='H'){
                            aProps.push('高度');
                        }else if(v.showName=='中心点'){
                            ;
                        }else{
                            aProps.push(v.showName);
                        }
                }
            });
        }
        obj[optionName] =aProps;
        return obj;
    }


    plusOperation(eventIndex){
        if(this.state.eventList[eventIndex]&&
            !this.state.eventList[eventIndex].enable){
            return;
        }
        this.curEventIndex =eventIndex;
        let eventList =this.state.eventList;
        if(eventList[this.curEventIndex].zhongHidden){
            let  arrHidden=[false,false,true,true,true,true];
            eventList[this.curEventIndex].zhongHidden=false;
            eventList[this.curEventIndex].children[0].arrHidden= arrHidden;
            this.setState({eventList:eventList});
        }else{
           WidgetActions['addEventChildren'](this.state.eventList[this.curEventIndex]);
        }
    }

    deleteOperation(curChildrenIndex,curEventIndex){
        if(this.state.eventList[curEventIndex]&&
            !this.state.eventList[curEventIndex].enable){
            return;
        }
        WidgetActions['delEventChildren'](this.state.eventList[curEventIndex],curChildrenIndex);
    }

    //将英文名转换成中文名
    getShowNameByName(type,name,curChildrenIndex,curEventIndex){
        let showName=name;

        let allWidgetsList =this.state.allWidgetsList;

        let curChild =this.state.eventList[curEventIndex].children[curChildrenIndex];
        if(allWidgetsList) {
            if (type == 'conFlag') {
                //获取当前事件的类名
                let conArr = [];
                let className = this.state.eventList[curEventIndex].className;
                if (className) {
                    propertyMap[className].map((item, index)=> {
                        if (item.isEvent === true) {
                            conArr.push(item);
                        }
                    });
                }
                if (this.state.conOption.length > 0) {
                    conArr = this.state.conOption;
                }
                conArr.map((v, i)=> {
                    if (name == v.name) {
                        showName = v.showName;
                    }
                });
            } else if (type == 'judgeValFlag' && curChild) {
                let judgeObjFlag = curChild.saveJudgeObjFlag ? curChild.saveJudgeObjFlag : curChild.judgeObjFlag;


                let judgeObjClassName = null;
                allWidgetsList.map((v, i)=> {
                    if (v.props.name == judgeObjFlag) {
                        judgeObjClassName = v.className;
                    }
                });

                if (judgeObjClassName && propertyMap[judgeObjClassName]) {
                    propertyMap[judgeObjClassName].map((v, i)=> {
                        if (name == 'width' || name=='W') {
                            showName = '宽度';
                        } else if (name == 'height'|| name=='H') {
                            showName = '高度';
                        }
                        if (v.name == name) {
                            showName = v.showName;
                        }
                    });
                }

            } else if (type == 'compareValFlag' && curChild) {
                let compareObjFlag = curChild.saveCompareObjFlag ? curChild.saveCompareObjFlag : curChild.compareObjFlag;


                if (compareObjFlag) {
                    let compareObjClassName = null;
                    allWidgetsList.map((v, i)=> {
                        if (v.props.name == compareObjFlag) {
                            compareObjClassName = v.className;
                        }
                    });

                    if (compareObjClassName && propertyMap[compareObjClassName]) {
                        propertyMap[compareObjClassName].map((v, i)=> {
                            if (name == 'width' || name=='W') {
                                showName = '宽度';
                            } else if (name == 'height'|| name=='H') {
                                showName = '高度';
                            }
                            if (v.name == name) {
                                showName = v.showName;
                            }
                        });

                    }
                }
            }
        }
          return showName?showName:'';
    }

   //根据中文名找到英文名,并保存
   getNameByCnName(type,value) {
       let name = '';
       let curChild = this.state.curChild;
       let allWidgetsList = this.state.allWidgetsList;
       if (type == 'conFlag') {
           this.state.conOption.map((v, i)=> {
               if (v.showName == value) {
                   name = v.name;
               }
           });
       } else if (type == 'judgeValFlag') {
           let judgeObjFlag = curChild.judgeObjFlag;
           let judgeObjClassName = null;
           allWidgetsList.map((v, i)=> {
               if (v.props.name == judgeObjFlag) {
                   judgeObjClassName = v.className;
               }
           });

           propertyMap[judgeObjClassName].map((v, i)=> {
               if (value == '宽度') {
                   name = 'width';
               } else if (value == '高度') {
                   name = 'height';
               }
               if (v.showName == value) {
                   name = v.name;
               }
           });
       } else if (type == 'compareValFlag') {
           let compareObjFlag = curChild.compareObjFlag;
           let compareObjClassName = null;
           allWidgetsList.map((v, i)=> {
               if (v.props.name == compareObjFlag) {
                   compareObjClassName = v.className;
               }
           });
           propertyMap[compareObjClassName].map((v, i)=> {
               if (value == '宽度') {
                   name = 'width';
               } else if (value == '高度') {
                   name = 'height';
               }
               if (v.showName == value) {
                   name = v.name;
               }
           });
       }
       return name;
   }

    getObjNameByKey(key,str,name){

        let obj = WidgetStore.getWidgetByKey(key);
        if(obj === undefined && key){
           return str;
        }

        if(name !== undefined){
            return name;
        }else if(obj){
            obj.props.name
        }


    }
    //点击下拉框
    onMenuClick(flag,newVal,newKey,e) {
        let eventList = this.state.eventList;
        let value =newVal? newVal:e.item.props.object;
        let key = this.curChildrenIndex;
        let arrHidden;
        let isRun = true;

        let initFlag = this.state.curChild; //初始化

        if (flag == 'conFlag') {
            value =this.getNameByCnName(flag,value)
            eventList[this.curEventIndex][flag] = value;
            //设置需要填入的值
            this.setNeedFill(value);
        }else if(flag == 'logicalFlag'){
            eventList[this.curEventIndex].logicalFlag =value;
        }else if(flag == 'judgeValFlag'){
            value =this.getNameByCnName(flag,value)
            eventList[this.curEventIndex].children[key][flag]=value;
        }else if(flag == 'compareValFlag'){
            value =this.getNameByCnName(flag,value)
            eventList[this.curEventIndex].children[key][flag]=value;
        }else {
            eventList[this.curEventIndex].children[key][flag] = value;
        }
        if(flag == 'compareObjFlag'){
            eventList[this.curEventIndex].children[key].showDropdown=false;
        }
        this.setState({eventList: eventList});
        let chooseEventClassName = this.getClassNameByobjName(value);

        switch (flag) {
            case 'judgeObjFlag':
                initFlag.judgeObjKey= newKey?newKey:e.item.props.keyVal;
                if (this.state.specialObject.indexOf(chooseEventClassName) >= 0) {
                    arrHidden = [false, false, true, false, false, true];
                } else {
                    arrHidden = [false, false, false, true, true, true];
                }
                //初始化后四个
                initFlag.judgeValFlag = '判断值';
                initFlag.compareFlag = '=';
                initFlag.compareObjFlag = '比较值/对象';
                initFlag.compareObjKey=null;
                initFlag.compareValFlag = '比较值';
                initFlag.arrHidden=arrHidden;
                break;
            case 'judgeValFlag':
                arrHidden = [false, false, false, false, false, true];
                //初始化后三个
                initFlag.compareFlag = '=';
                initFlag.compareObjFlag = '比较值/对象';
                initFlag.compareObjKey=null;
                initFlag.compareValFlag = '比较值';
                initFlag.arrHidden=arrHidden;
                break;
            case 'compareObjFlag':
                initFlag.compareObjKey= newKey?newKey:e.item.props.keyVal;
                arrHidden = this.state.curChild.arrHidden;
                if (this.state.specialObject.indexOf(chooseEventClassName) >= 0) {
                    arrHidden[5] = true;
                    initFlag.compareValFlag = '比较值';
                    initFlag.arrHidden= arrHidden;
                } else {
                    arrHidden[5] = false;
                    initFlag.compareValFlag = '比较值';
                    initFlag.arrHidden=arrHidden;
                }
                break;
            default :
                isRun = false;
        }

        if (isRun) {
            let eventList = this.state.eventList;
            eventList[this.curEventIndex].children[this.curChildrenIndex] = initFlag;
            //判断事件面板所需宽度
            this.setEventBoxWidth(eventList);
            this.setState({eventList: eventList});
        }
    }

    //点击select,出现下拉框之前的事件
    setCurOption(curChildrenIndex,curEventIndex,type,isUpdate,e){
        this.curChildrenIndex =curChildrenIndex;
        this.curEventIndex=curEventIndex;
        let option = type.replace('Flag', 'Option');
        let obj={};
        let curChild = this.state.eventList[curEventIndex].children[curChildrenIndex];

        //每次点击,从新获取下拉框的内容
        switch (type){
            case 'conFlag':
                obj= this.getConditionOption(option,curChild);
                break;
            case 'judgeObjFlag':
                obj= this.getJudgeObjOption(option,curChild);
                break;
            case 'judgeValFlag':
                obj= this.getJudgeValOption(option,curChild);
                break;
            case 'compareObjFlag':
                obj= this.getCompareObjOption(option,curChild);
                break;
            case 'compareValFlag':
                obj= this.getCompareValOption(option,curChild);
                break;
            default:
                console.log('failed');
        }

        obj.curChild =curChild;
        this.setState(obj);

        if(isUpdate){
            this.forceUpdate();
        }
    }

    inputChange(val,event) {

        let eventList = this.state.eventList;
        eventList[this.curEventIndex].children[this.curChildrenIndex][val] = event.target.value;
        this.setState({
            eventList: eventList
        });
    }

    //focus
    saveOldVal(type,curChildIndex,curEventIndex,event){
        this.oldVal =event.target.value;
        let eventList =this.state.eventList;
        if(type == 'judgeObjFlag'){
          eventList[curEventIndex].children[curChildIndex].saveJudgeObjFlag =event.target.value;
        }else if(type=='compareObjFlag'){
          eventList[curEventIndex].children[curChildIndex].saveCompareObjFlag =event.target.value;
            event.target.select()
        }
        this.setState({eventList:eventList});
    }

    setInputValAuto(type,event){
        let  newVal =event.target.value;
        let tag=true;
        let option = type.replace('Flag', 'Option');
        let eventList =this.state.eventList;
        let arr=this.state[option];
        let key =null;

        if(type=='compareObjFlag'){
            eventList[this.curEventIndex].children[this.curChildrenIndex].showDropdown=false;
            this.setState({eventList: eventList});
         }
        arr.map((v,i)=>{
            if(v.showName && v.showName==newVal){
                tag=false;
                key=v.key;
            }else if(v==newVal){
                tag=false;
            }
        });

            if (tag) {
                if (type == 'compareObjFlag') {
                    let arrHidden = eventList[this.curEventIndex].children[this.curChildrenIndex].arrHidden;
                    arrHidden[5] = true;
                    if(!newVal || /^\s+$/.test(newVal) ){
                        eventList[this.curEventIndex].children[this.curChildrenIndex].compareObjFlag='比较值/对象';
                        eventList[this.curEventIndex].children[this.curChildrenIndex].compareObjKey=null;
                    }
                    this.setEventBoxWidth(eventList);
                } else {
                    eventList[this.curEventIndex].children[this.curChildrenIndex][type] = this.oldVal;
                }
                this.setState({eventList: eventList});
            } else {
                //触发下一个下拉框
                if(newVal !=this.oldVal){
                    this.onMenuClick(type, newVal,key);
                } 
            }
        this.oldVal=null;

        eventList[this.curEventIndex].children[this.curChildrenIndex].saveJudgeObjFlag=null;
        eventList[this.curEventIndex].children[this.curChildrenIndex].saveCompareObjFlag=null;
        this.setState({eventList: eventList});
    }



    menuList(flag) {
        let option = flag.replace('Flag', 'Option');
        return (<Menu className='dropDownMenu' onClick={this.onMenuClick.bind(this, flag,null,null)}>
            {
                this.state[option].map((v, i)=> {
                    return <MenuItem key={i} index={i} object={v.showName?v.showName:v} keyVal={v.showName?v.key:null}>{v.showName?v.showName:v}</MenuItem>;
                })
            }
        </Menu>)
    }

    setEventBoxWidth(eventList){
        let tag=false;
        let oEventBox=document.getElementsByClassName('EventBox')[0];

        let elist=eventList?eventList:this.state.eventList;
            elist.map((v,i)=>{
                if(v.children){
                    v.children.map((item,index)=>{
                        if( !item.arrHidden[2] && !item.arrHidden[5]){
                            tag=true;
                        }
                    });
                }
        });
        oEventBox.style.width=tag?'820px':'740px';

        this.setState({toLong:tag});
    }

    getTypeArr(type){
        if(type==0||type==1||type==5){
            //Integer,Number
            return [0,1,5];
        }else if(type==2||type==3){
            //String,Text
            return [2,3];
        }else if(type==4||type==10){
            //Boolean,Boolean2
            return [4,10];
        }else if(type==6||type ==9){
            //Color ,Color2
            return [6,9];
        }else{
            return [type];
        }
    }


    //设置触发条件的填入值
    setNeedFill(value){
        //判定是否需要显示填入值的样式
        let isShow=false;
        let eventList = this.state.eventList;
        let needFill=[];
        this.state.conOption.map((v,i)=>{
            if(v.name==value && v.needFill){
                isShow=true;
                needFill=v.needFill;
            }
        });
        if(isShow){
            eventList[this.curEventIndex].needFill =needFill;
        }else{
            eventList[this.curEventIndex].needFill =undefined;
        }
        this.setState({eventList:eventList});
    }

    onChangeProp(index,type,value){
        let eventList =this.state.eventList;
        if(type=='number'){
            eventList[this.curEventIndex].needFill[index].default =value;
        }else if(type=='string'){
            eventList[this.curEventIndex].needFill[index].default =value.target.value;
        }else if(type=='select'){
            eventList[this.curEventIndex].needFill[index].default =value;
        }
        this.setState({eventList:eventList});

    }

    getAntdComponent(item,index,obj){
        if(item.type=='number'){
            return <InputNumber disabled={!obj.enable} step={1}  min={0} className='dropDown-input-content' defaultValue={item.default} onChange={this.onChangeProp.bind(this,index,item.type)} />
        }
        if(item.type=='string'){
            return <Input disabled={!obj.enable} className='dropDown-input-content' defaultValue={item.default} onChange={this.onChangeProp.bind(this,index,item.type)} />
        }
        if(item.type=='select'){
           let optionArr=[];
            item.option.map((v,i)=>{
                optionArr.push(<Option  key={v}  className='dropDown-input-option'>{v}</Option>);
            });
            return <Select disabled={!obj.enable} className='dropDown-input-content' defaultValue={item.default} onChange={this.onChangeProp.bind(this,index,item.type)}>{optionArr}</Select>
        }
    }

    showCompareDropDown(name,curEventIndex,curChildrenIndex){
        let eventList=this.state.eventList;
        eventList.map((v,i)=>{
           v.children.map((item,index)=>{
                if(item.showDropdown){item.showDropdown=false;}
           });
        });
        eventList[curEventIndex].children[curChildrenIndex].showDropdown =true;
        this.setState({eventList:eventList});
        this.refs[name].focus();
    }

    content(v,i){
            return  <div className={$class('item f--h', {'item-not-enable': !v.enable})} key={i} id={'event-item-'+v.eid} >
                <span className='left-line' />
                <div className='item-main flex-1'>
                    <div className='item-header f--h'>
                        <span className='close-line' onClick={this.delEvent.bind(this,i)} />
                        <div className='item-title flex-1 f--h'>
                            <div className='left'>
                                <div className='left-layer  f--h'>
                                    <div className="enable-button-div">
                                        <button className={$class("title-icon")}
                                                onClick={this.onEventEnable.bind(this, v)}/>
                                    </div>
                                    <div className='dropDown-layer long'>
                                        {
                                            !v.enable
                                                ? <div  className={$class('title f--hlc',{'title-gray':v.conFlag=='触发条件'})} >
                                                    {this.getShowNameByName('conFlag',v.conFlag,0,i)}
                                                    <span className='icon' /></div>
                                                :<Dropdown overlay={this.menuList('conFlag')}
                                                        onClick={this.setCurOption.bind(this,0,i,'conFlag',false)}
                                                        getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                        trigger={['click']}>
                                                    <div  className={$class('title f--hlc',{'title-gray':v.conFlag=='触发条件'})} >
                                                        {this.getShowNameByName('conFlag',v.conFlag,0,i)}
                                                        <span className='icon' /></div>
                                                </Dropdown>
                                        }
                                        <div className={$class('dropDown',{'hidden':v.needFill===undefined})}>
                                            {
                                                v.needFill===undefined
                                                    ?''
                                                    :v.needFill.map((n,m)=>{
                                                    let content;
                                                    if(n.type=='select'){
                                                        content =(<div key={m} className='dropDown-input2 dropDown-input-full '> {this.getAntdComponent(n,m,v)}</div>)
                                                    }else{
                                                        content= (<div key={m} className='dropDown-input2 dropDown-input-full '>
                                                            <div className='dropDown-input-txt-half'>{n.showName}</div>
                                                            <div className='dropDown-input-half'>
                                                                {this.getAntdComponent(n,m,v)}
                                                            </div>
                                                        </div>)
                                                    }
                                                    return  content
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {
                                !v.children || v.children.length === 0
                                    ? null
                                    :   <div className={$class('zhong',{'hidden':v.zhongHidden,'zhongToLong':this.state.toLong})}>
                                    {
                                        v.children.map((v1,i1)=>{
                                            let judgeObjName = this.getObjNameByKey(v1.judgeObjKey,'判断对象',v1.judgeObjFlag);
                                            let judgeValName = this.getShowNameByName('judgeValFlag',v1.judgeValFlag,i1,i);
                                            let compareObjName = this.getObjNameByKey(v1.compareObjKey,'比较值/对象',v1.compareObjFlag);
                                            let compareValName = this.getShowNameByName('compareValFlag',v1.compareValFlag ,i1,i);
                                            return  <div className={$class("list f--hlc", {'list-not-enable': !v1.enable})} key={i1}>
                                                <span className="supplement-line" />
                                                <div className="enable-button-div">
                                                    <button className={$class("title-icon")}
                                                            onClick={this.onChildEnable.bind(this, v, v1)}/>
                                                </div>
                                                <div className={$class('dropDown-layer short',{'hidden':v1.arrHidden[0]})} >

                                                    <div className="title f--hlc cursor_default">
                                                        且
                                                    </div>
                                                    {/*
                                                    <Dropdown
                                                        overlay={this.menuList('logicalFlag')}
                                                        onClick={this.setCurOption.bind(this,i1,i,'logicalFlag',false)}
                                                        getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                        trigger={['click']}>
                                                        <div className='title f--hlc'>
                                                            {v.logicalFlag}
                                                            <span className='icon' /></div>
                                                    </Dropdown>
                                                     */}
                                                </div>

                                                <div className={$class('dropDown-layer middle',{'hidden':v1.arrHidden[1]})} >
                                                    {
                                                        !v1.enable
                                                            ? <div className={$class('title f--hlc',{'title-gray':v1.judgeObjFlag=='判断对象'})} >
                                                                {judgeObjName}
                                                                <span className='icon' /></div>
                                                            : <Dropdown
                                                                overlay={this.menuList('judgeObjFlag')}
                                                                onClick={this.setCurOption.bind(this,i1,i,'judgeObjFlag',false)}
                                                                getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                                trigger={['click']}>
                                                                <div className={$class('title f--hlc',{'title-gray':v1.judgeObjFlag=='判断对象'})} >
                                                                    <input  value= {judgeObjName}
                                                                        onChange={this.inputChange.bind(this,'judgeObjFlag')} onFocus={this.saveOldVal.bind(this,'judgeObjFlag',i1,i)}   onBlur={this.setInputValAuto.bind(this,'judgeObjFlag')} className='judgeObjFlag-input'/>
                                                                    <span className='icon' /></div>
                                                            </Dropdown>
                                                    }
                                                </div>

                                                <div className={$class('dropDown-layer middle',{'hidden':v1.arrHidden[2]})} >
                                                    {
                                                        !v1.enable
                                                            ?  <div className={$class('title f--hlc',{'title-gray':v1.judgeValFlag=='判断值'})}>
                                                                {judgeValName}
                                                                <span className='icon' /></div>
                                                            : <Dropdown
                                                                overlay={this.menuList('judgeValFlag')}
                                                                onClick={this.setCurOption.bind(this,i1,i,'judgeValFlag',true)}
                                                                getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                                trigger={['click']}>
                                                                <div className={$class('title f--hlc',{'title-gray':v1.judgeValFlag=='判断值'})} >
                                                                    <input value= {judgeValName}
                                                                        onChange={this.inputChange.bind(this,'judgeValFlag')}
                                                                        onFocus={this.saveOldVal.bind(this,'judgeValFlag',i1,i)}
                                                                        onBlur={this.setInputValAuto.bind(this,'judgeValFlag')}
                                                                        className='judgeValFlag-input'/>
                                                                    <span className='icon' /></div>
                                                            </Dropdown>
                                                    }
                                                </div>
                                                <div className={$class('dropDown-layer short',{'hidden':v1.arrHidden[3]})} >
                                                    {
                                                        !v1.enable
                                                            ? <div className='title f--hlc'>
                                                                {v1.compareFlag}
                                                                <span className='icon' /></div>
                                                            : <Dropdown
                                                                overlay={this.menuList('compareFlag')}
                                                                onClick={this.setCurOption.bind(this,i1,i,'compareFlag',false)}
                                                                getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                                trigger={['click']}>
                                                                <div className='title f--hlc'>
                                                                    {v1.compareFlag}
                                                                    <span className='icon' /></div>
                                                            </Dropdown>
                                                    }
                                                </div>

                                                <div className={$class('dropDown-layer middle',{'hidden':v1.arrHidden[4]})} >
                                                    {
                                                        !v1.enable
                                                            ? <div className={$class('title f--hlc',{'title-gray':v1.compareObjFlag=='比较值/对象'})} >
                                                                {compareObjName}
                                                                <span className='icon'/></div>
                                                            : <Dropdown
                                                                overlay={this.menuList('compareObjFlag')}
                                                                onClick={this.setCurOption.bind(this,i1,i,'compareObjFlag',false)}
                                                                visible={v1.showDropdown}
                                                                getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                                trigger={['click']}>
                                                                <div className={$class('title f--hlc',{'title-gray':v1.compareObjFlag=='比较值/对象'})} >
                                                                    <input value= {compareObjName}
                                                                        onChange={this.inputChange.bind(this,'compareObjFlag')}
                                                                        onFocus={this.saveOldVal.bind(this,'compareObjFlag',i1,i)}
                                                                        onBlur={this.setInputValAuto.bind(this,'compareObjFlag')}
                                                                        ref={'compareObjFlag'+i+i1}
                                                                        className='compareObjFlag-input'/>
                                                                    <span className='icon' onClick={this.showCompareDropDown.bind(this,'compareObjFlag'+i+i1,i,i1)} /></div>
                                                            </Dropdown>
                                                    }
                                                </div>
                                                <div className={$class('dropDown-layer mr20 middle',{'hidden':v1.arrHidden[5]})} >
                                                    {
                                                        !v1.enable
                                                            ? <div className={$class('title f--hlc',{'title-gray':v1.compareValFlag=='比较值'})} >
                                                                {compareValName}
                                                                <span className='icon'/></div>
                                                            : <Dropdown
                                                                overlay={this.menuList('compareValFlag')}
                                                                onClick={this.setCurOption.bind(this,i1,i,'compareValFlag',true)}
                                                                getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                                trigger={['click']}>
                                                                <div className={$class('title f--hlc',{'title-gray':v1.compareValFlag=='比较值'})} >
                                                                    <input value= {compareValName}
                                                                        onChange={this.inputChange.bind(this,'compareValFlag')}
                                                                        onFocus={this.saveOldVal.bind(this,'compareValFlag',i1,i)}
                                                                        onBlur={this.setInputValAuto.bind(this,'compareValFlag')}
                                                                        className='compareValFlag-input'/>
                                                                    <span className='icon'/></div>
                                                            </Dropdown>
                                                    }
                                                </div>
                                                <button className={$class('close-btn')}
                                                        disabled={!v.enable}
                                                        onClick={this.deleteOperation.bind(this,i1,i)} />
                                            </div>
                                        })
                                    }
                                </div>
                            }
                            <div className='right flex-1'>
                                <div className='right-layer'>
                                    <button className={$class('plus-btn')}
                                            disabled={!v.enable}
                                            onClick={this.plusOperation.bind(this,i)}>
                                        <div className='btn'>
                                            <span className='heng' />
                                            <span className='shu' />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='item-content'>
                        {
                            !v.specificList || v.specificList.length === 0
                                ? null
                                : v.specificList.map((v2,i2)=>{
                                return <Property key={i2}
                                                 specific={v2}
                                                 event={v}
                                                 eventSelectTargetKey={this.props.eventSelectTargetKey}
                                                 wKey={this.props.wKey}
                                                 activeKey={this.props.activeKey}/>
                            })
                        }
                    </div>
                </div>
            </div>
    }

    render() {
        return (
            <div className={$class('Event',{'active' :this.props.activeKey === this.props.wKey })}
                 onClick={this.chooseEventBtn.bind(this, this.props.wKey)}
                 id={'event-tree-'+this.props.wKey}>
                <div className='E--title f--h'>
                    <div className='title-content f--hlc flex-1'>
                        <div className={$class('close-btn', {'expanded-btn': this.state.expanded})}
                             onClick={this.expandedBtn.bind(this, false)}>
                            <span className='heng'/>
                        </div>
                        <div className={$class('open-btn', {'expanded-btn': this.state.expanded})}
                             onClick={this.expandedBtn.bind(this, true)}>
                            <span className='heng'/><span className='shu'/>
                        </div>
                        <div className='name flex-1'>{ this.props.name }</div>
                    </div>

                    <div className={$class('btn f--hlc',{'hidden' :this.props.activeKey !== this.props.wKey })}
                         onClick={this.addEventBtn}>
                        <div className='btn-name'>添加事件</div>
                        <div className='btn-icon'><span className='heng'/><span  className='shu'/></div>
                    </div>
                </div>
                <div className={$class('E--content',{'hidden': !this.state.expanded})}>
                    {
                        !this.state.eventList || this.state.eventList.length===0
                            ? null
                            : this.state.eventList.map(this.content)
                    }
                </div>
            </div>
        );
    }
}

module.exports = Event;

