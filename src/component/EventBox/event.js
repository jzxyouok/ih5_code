//事件
import React from 'react';
import $class from 'classnames'

import Property from './Property'
import WidgetStore, {funcType} from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'
import  {propertyMap} from '../PropertyMap'
import {eventTempData} from './tempData'
import { Menu, Dropdown, Icon } from 'antd';
const MenuItem = Menu.Item;


class Event extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            expanded: true,
            objName: [],
            toLong:false,
            eventList: this.props.eventList,
            selectWidget: this.props.widget,
            allWidgetsList: null,
            activeKey: this.props.activeKey,  //当前激活事件的key
            specialObject: ['counter', 'text', 'strVar', 'intVar'],

            //用于下拉框显示
            conOption: [],//每次点击后赋值
            logicalOption: ['and', 'or', 'not'],  //下拉选项
            judgeObjOption: [],//出现新的widget则更新
            judgeValOption: ['判断值1', '判断值2'],
            compareOption: ['=', '>', '<', '!=', '≥', '≤'],
            compareObjOption: [],//出现新的widget则更新
            compareValOption: ['比较值1', '比较值2']
        };


        this.curChildrenIndex = 0;
        this.curEventIndex = 0;

        this.chooseEventBtn = this.chooseEventBtn.bind(this);
        this.expandedBtn = this.expandedBtn.bind(this);
        this.addEventBtn = this.addEventBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);

        this.getConditionOption = this.getConditionOption.bind(this);   //获取触发条件
        this.getChooseObjByIndex=this.getChooseObjByIndex.bind(this);

        this.getJudgeValType =this.getJudgeValType.bind(this);
        this.getCompareValOption =this.getCompareValOption.bind(this);


        this.menuList_pub =this.menuList_pub.bind(this);
        this.menuList =this.menuList.bind(this);
        this.setEventBoxWidth=this.setEventBoxWidth.bind(this);

        this.onSetSpecificListProperty = this.onSetSpecificListProperty.bind(this);

    }

    componentWillReceiveProps(nextProps) {
        nextProps.eventList.map((v,i)=>{
            if(!v.children){
              //改造,有空后改造下tree
              v.children=[{
                  judgeObjFlag:'判断对象',
                  judgeValFlag:'判断值',
                  compareFlag:'=',
                  compareObjFlag:'比较对象',
                  compareValFlag:'比较值',
                  operationManager: {
                      arrHidden: [true,true,true,true,true,true]  //逻辑运算符,判断对象,判断值,比较运算符,比较对象,比较值
                  }
              }];
             v.zhongHidden=true;
             v.logicalFlag='and';
             v.conFlag='触发条件';
          }
        });

        this.setState({
            activeKey:nextProps.activeKey,
            eventList:nextProps.eventList
        })

    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());

        //获取当前事件对象的触发条件
        this.getConditionOption();
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
        }

        if(widget.allWidgets){
            let arr=[];
            let arr2=[];

            widget.allWidgets.map((v,i)=>{
                arr.push([v.className,v.props.name]);
                arr2.push(v.props.name);
            });

            //此处可设置对象关系,将对象的引用注入进来.
            this.setState({
                objName:arr,   //类名与命名
                allWidgetsList: widget.allWidgets,
                judgeObjOption:arr2,  //命名
                compareObjOption:arr2 //命名
            });
        }

        if (widget.selectWidget) {
            this.setState({
                selectWidget: widget.selectWidget
            }, ()=> {
                this.getConditionOption();
            });
        }
        else if (widget.updateFunction&&widget.updateFunction.widget){
            let eventList = this.state.eventList;
            eventList.forEach(v=>{
                v.specificList.forEach(s=>{
                    if(s.action){
                        if(s.action.type === funcType.customize) {
                            if (s.action.func.widget.key === widget.updateFunction.widget.key) {
                                let property = this.onSetSpecificListProperty(s.action, s.action.func.params);
                                s.action.property = property;
                            }
                        }
                    }
                });
            });
            this.setState({
                eventList:eventList
            })
        }

    }

    onSetSpecificListProperty(action, params) {
        //params
        let newProperty = null;
        if(params&&params.length>0){
            newProperty = [];
            params.forEach(p =>{
                if(p.name&&p.type){
                    let index = -1;
                    if(action.property){
                        action.property.forEach(i =>{
                            if(i.name === p.name){
                                newProperty.push(i);
                            }
                        });
                    }
                    if(index === -1) {
                        newProperty.push({'name':p.name, showName:p.name, 'value':null, 'type':p.type.type});
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
        let propArr =this.state.eventList[this.curEventIndex].children[this.curChildrenIndex].propArr;
        let saveVal=null;
        propArr.map((v,i)=>{
             if(v.name== val){
                 saveVal =  v.type;
             }
        });
        return saveVal;
    }

    chooseEventBtn(nid){
        this.props.chooseEventBtn(nid);
    }

    addEventBtn(e) {
        e.stopPropagation();
        WidgetActions['addEvent']();
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

    getCompareValOption(propArr){
        let judgeValType =this.state.eventList[this.curEventIndex].children[this.curChildrenIndex].judgeValType;
        let arr=[];
        propArr.map((v,i)=>{
            if(v.type == judgeValType){
                arr.push(v.name);
            }
        });
       return arr;
    }

    delEvent(index){
        if(index !=0){
            WidgetActions['delEvent'](this.state.eventList,index);
        }
    }

    expandedBtn(expanded, event){
        event.stopPropagation();
        this.setState({
            expanded: expanded
        });
    }

    //触发条件
    getConditionOption(){
        let aOption=[];
        let className = this.state.selectWidget.className;
        propertyMap[className].map((item,index)=>{
            if(item.isEvent === true){
                aOption.push(item.name);
            }
        });

        this.setState({conOption:aOption});
    }

    getChooseObjByIndex(index){
        return this.state.allWidgetsList[index];
    }

    plusOperation(eventIndex){

        this.curEventIndex =eventIndex;

        let eventList =this.state.eventList;
        if(eventList[this.curEventIndex].zhongHidden){
            let  arrHidden=[false,false,true,true,true,true];
            eventList[this.curEventIndex].zhongHidden=false;
            eventList[this.curEventIndex].children[0].operationManager={
                arrHidden: arrHidden
            }
            this.setState({eventList:eventList});
        }else{
           WidgetActions['addEventChildren'](this.state.eventList[this.curEventIndex]);
        }
    }

    deleteOperation(curChildrenIndex,curEventIndex){
        WidgetActions['delEventChildren'](this.state.eventList[curEventIndex],curChildrenIndex);
    }

    //获取对象属性
    setObjProperty(chooseEventClassName){
        let propArr=[];
        let nameArr=[];

        if(chooseEventClassName=='stage'){
            chooseEventClassName='root';
        }
           propertyMap[chooseEventClassName].map((v,i)=>{
             if(v.isProperty && v.name !='id'){
                 nameArr.push(v.name);
                 propArr.push({name:v.name,type:v.type});
             }
           });

       return {
           nameArr:nameArr,
           propArr:propArr
       };
    }

    onMenuClick(flag,e) {
        e.domEvent.stopPropagation();

        let eventList = this.state.eventList;
        let index =e.item.props.index;
        let value =e.item.props.object
        let key = this.curChildrenIndex;

        if (flag == 'conFlag') {
            eventList[this.curEventIndex][flag] = value;
        } else if(flag == 'logicalFlag'){
            eventList[this.curEventIndex].logicalFlag =value;
        }else {
            eventList[this.curEventIndex].children[key][flag] = value;
        }

        this.setState({eventList: eventList});

        let arrHidden;
        let isRun = true;

        let initFlag = this.state.eventList[this.curEventIndex].children[this.curChildrenIndex]; //初始化

        let chooseEventClassName = this.getClassNameByobjName(value);


        switch (flag) {
            case 'judgeObjFlag':
                let judgeValOption = [];
                if (this.state.specialObject.indexOf(chooseEventClassName) >= 0) {
                    arrHidden = [false, false, true, false, false, true];
                } else {
                    arrHidden = [false, false, false, true, true, true];
                    //非五类
                    let propObj = this.setObjProperty(chooseEventClassName);
                    judgeValOption =propObj.nameArr;
                    initFlag.propArr =propObj.propArr;
                }
                //初始化后四个

                initFlag.judgeObj =this.getChooseObjByIndex(index);
                initFlag.judgeValOption = judgeValOption;

                initFlag.judgeValFlag = '判断值';
                initFlag.compareFlag = '=';
                initFlag.compareObjFlag = '比较对象';
                initFlag.compareValFlag = '比较值';
                initFlag.operationManager = {
                    arrHidden: arrHidden
                }
                break;
            case 'judgeValFlag':
                arrHidden = [false, false, false, false, false, true];
                //初始化后三个
                initFlag.compareFlag = '=';
                initFlag.compareObjFlag = '比较对象';
                initFlag.compareValFlag = '比较值';
                initFlag.operationManager = {
                    arrHidden: arrHidden
                }

                //设定选中比较值的类型
                initFlag.judgeValType=this.getJudgeValType(value);
                break;
            case 'compareObjFlag':
                arrHidden = this.state.eventList[this.curEventIndex].children[this.curChildrenIndex].operationManager.arrHidden;

                let compareValOption;

                if (this.state.specialObject.indexOf(chooseEventClassName) >= 0) {
                    arrHidden[5] = true;
                    initFlag.operationManager = {
                        arrHidden: arrHidden
                    }
                } else {
                    arrHidden[5] = false;
                    //非五类
                    compareValOption = this.setObjProperty(chooseEventClassName);

                    let propObj = this.setObjProperty(chooseEventClassName);
                    compareValOption =this.getCompareValOption(propObj.propArr);

                    initFlag.compareObj =this.getChooseObjByIndex(index);

                    initFlag.compareValOption =compareValOption;

                    initFlag.compareValFlag = '比较值';
                    initFlag.operationManager = {
                        arrHidden: arrHidden
                    }
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

    setCurChildrenIndex(index,eventIndex,isUpdate,e){
        this.curChildrenIndex =index;
        this.curEventIndex=eventIndex;

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

    menuList_pub(flag) {
        let option = flag.replace('Flag', 'Option');
        return (<Menu className='dropDownMenu' onClick={this.onMenuClick.bind(this,flag)}>
            {
                this.state[option].map((v, i)=> {
                    return <MenuItem key={i} index={i} object={v}>{v}</MenuItem>;
                })
            }
        </Menu>)
    }
    menuList(flag) {
        let option = flag.replace('Flag', 'Option');
        let children = this.state.eventList[this.curEventIndex].children[this.curChildrenIndex];
        if( children && children[option]){
            return (<Menu className='dropDownMenu' onClick={this.onMenuClick.bind(this,flag)}>
                {
                    children[option].map((v, i)=> {
                        return <MenuItem key={i} index={i}  object={v}>{v}</MenuItem>;
                    })
                }
            </Menu>)
        }
        return (<Menu></Menu>)
    }
    setEventBoxWidth(eventList){
        let tag=false;
        let oEventBox=document.getElementsByClassName('EventBox')[0];

        let elist=eventList?eventList:this.state.eventList;

            elist.map((v,i)=>{
                if(v.children){
                    v.children.map((item,index)=>{
                        if(!item.operationManager.arrHidden[5]){
                            tag=true;
                        }
                    });
                }
        });
        oEventBox.style.width=tag?'820px':'740px';

        this.setState({toLong:tag});
    }

    render() {
        let content = ((v,i)=>{
            return  <div className='item f--h' key={i} id={'event-item-'+v.eid}>
                <span className='left-line' />
                <div className='item-main flex-1'>
                    <div className='item-header f--h'>
                        <span className='close-line' onClick={this.delEvent.bind(this,i)} />
                        <div className='item-title flex-1 f--h'>
                            <div className='left'>
                                <div className='left-layer  f--h'>
                                    <span className='title-icon' />
                                    <div className='dropDown-layer long'>
                                        <Dropdown
                                            overlay={this.menuList_pub('conFlag')}
                                            onClick={this.setCurChildrenIndex.bind(this,null,i,false)}
                                            getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                            trigger={['click']}>
                                            <div  className={$class('title f--hlc',{'title-gray':v.conFlag==this.state.conFlag})} >
                                                {v.conFlag}
                                                <span className='icon' /></div>
                                        </Dropdown>
                                        <div className='dropDown'></div>
                                    </div>
                                </div>
                            </div>
                            {
                                !v.children || v.children.length === 0
                                    ? null
                                    :   <div className={$class('zhong',{'hidden':v.zhongHidden,'zhongToLong':this.state.toLong})}>
                                    {
                                        v.children.map((v1,i1)=>{
                                            return  <div className="list f--hlc" key={i1}>
                                                <span className="supplement-line" />
                                                <div className={$class('dropDown-layer short',{'hidden':v1.operationManager.arrHidden[0]})} >
                                                    <Dropdown
                                                        overlay={this.menuList_pub('logicalFlag')}
                                                        onClick={this.setCurChildrenIndex.bind(this,i1,i,false)}
                                                        getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                        trigger={['click']}>
                                                        <div className='title f--hlc'>
                                                            {v.logicalFlag}
                                                            <span className='icon' /></div>
                                                    </Dropdown>
                                                </div>

                                                <div className={$class('dropDown-layer middle',{'hidden':v1.operationManager.arrHidden[1]})} >
                                                    <Dropdown
                                                        overlay={this.menuList_pub('judgeObjFlag')}
                                                        onClick={this.setCurChildrenIndex.bind(this,i1,i,false)}
                                                        getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                        trigger={['click']}>
                                                        <div   className={$class('title f--hlc',{'title-gray':v1.judgeObjFlag==this.state.judgeObjFlag})} >
                                                            <input value= {v1.judgeObjFlag}  onChange={this.inputChange.bind(this,'judgeObjFlag')}  className='judgeObjFlag-input'/>
                                                            <span className='icon' /></div>
                                                    </Dropdown>
                                                    <div className="dropDown"></div>
                                                </div>

                                                <div className={$class('dropDown-layer middle',{'hidden':v1.operationManager.arrHidden[2]})} >
                                                    <Dropdown
                                                        overlay={this.menuList('judgeValFlag')}
                                                        onClick={this.setCurChildrenIndex.bind(this,i1,i,true)}
                                                        getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                        trigger={['click']}>
                                                        <div    className={$class('title f--hlc',{'title-gray':v1.judgeValFlag==this.state.judgeValFlag})} >

                                                            <input value= {v1.judgeValFlag}  onChange={this.inputChange.bind(this,'judgeValFlag')}  className='judgeValFlag-input'/>
                                                            <span className='icon' /></div>
                                                    </Dropdown>
                                                    <div className="dropDown"></div>
                                                </div>
                                                <div className={$class('dropDown-layer short',{'hidden':v1.operationManager.arrHidden[3]})} >
                                                    <Dropdown
                                                        overlay={this.menuList_pub('compareFlag')}
                                                        onClick={this.setCurChildrenIndex.bind(this,i1,i,false)}
                                                        getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                        trigger={['click']}>
                                                        <div className='title f--hlc'>
                                                            {v1.compareFlag}
                                                            <span className='icon' /></div>
                                                    </Dropdown>
                                                    <div className="dropDown"></div>
                                                </div>

                                                <div className={$class('dropDown-layer middle',{'hidden':v1.operationManager.arrHidden[4]})} >
                                                    <Dropdown
                                                        overlay={this.menuList_pub('compareObjFlag')}
                                                        onClick={this.setCurChildrenIndex.bind(this,i1,i,false)}
                                                        getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                        trigger={['click']}>
                                                        <div  className={$class('title f--hlc',{'title-gray':v1.compareObjFlag==this.state.compareObjFlag})} >
                                                            <input value= {v1.compareObjFlag}  onChange={this.inputChange.bind(this,'compareObjFlag')}  className='compareObjFlag-input'/>
                                                            <span className='icon' /></div>
                                                    </Dropdown>
                                                    <div className="dropDown"></div>
                                                </div>
                                                <div className={$class('dropDown-layer mr20 middle',{'hidden':v1.operationManager.arrHidden[5]})} >
                                                    <Dropdown
                                                        overlay={this.menuList('compareValFlag')}
                                                        onClick={this.setCurChildrenIndex.bind(this,i1,i,true)}
                                                        getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                        trigger={['click']}>
                                                        <div   className={$class('title f--hlc',{'title-gray':v1.compareValFlag==this.state.compareValFlag})} >
                                                            <input value= {v1.compareValFlag}  onChange={this.inputChange.bind(this,'compareValFlag')}  className='compareValFlag-input'/>

                                                            <span className='icon' /></div>
                                                    </Dropdown>
                                                    <div className="dropDown"></div>
                                                </div>
                                                <span className={$class('close-btn')} onClick={this.deleteOperation.bind(this,i1,i)} />
                                            </div>
                                        })
                                    }
                                </div>
                            }
                            <div className='right flex-1'>
                                <div className='right-layer'>
                                    <div className={$class('plus-btn')}   onClick={this.plusOperation.bind(this,i)}>
                                        <div className='btn'>
                                            <span className='heng' />
                                            <span className='shu' />
                                        </div>
                                    </div>
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
                                                 wKey={this.props.wKey}
                                                 activeKey={this.props.activeKey}/>
                            })
                        }
                    </div>
                </div>
            </div>
        });
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
                            : this.state.eventList.map(content)
                    }
                </div>
            </div>
        );
    }
}

module.exports = Event;

