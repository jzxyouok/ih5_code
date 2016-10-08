//事件
import React from 'react';
import $class from 'classnames'

import Property from './Property'
import WidgetStore from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'
import  {propertyMap} from '../PropertyMap'
import {eventTempData} from './tempData'
import { Menu, Dropdown, Icon } from 'antd';
const MenuItem = Menu.Item;


class Event extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            treeList: [], //事件面板树
            expanded: true,
            objName: [],
            eventList: this.props.eventList,
            selectWidget: this.props.widget,
            allWidgetsList: null,
            activeKey: this.props.activeKey,  //当前激活事件的key
            specialObject: ['counter', 'text', 'strVar', 'intVar'],

            conOption: [],
            logicalOption: ['and', 'or', 'not'],  //下拉选项
            judgeObjOption: [],
            judgeValOption: ['计算1', '计算2'],
            compareOption: ['=', '>', '<', '!=', '>=', '<='],
            compareObjOption: [],
            compareValOption: ['比较值1', '比较值2'],


            conFlag: '触发条件',  //初始值
            logicalFlag: 'and',
            judgeObjFlag: '判断对象',
            judgeValFlag: '判断值',
            compareFlag: '=',
            compareObjFlag: '比较对象',
            compareValFlag: '比较值',

            operationManager: {  //下拉框显现管理
                zhongHidden: true,
                curShow: -1,
                arrHidden: [true, true, true, true, true, true]  //逻辑运算符,判断对象,判断值,比较运算符,比较对象,比较值
            }
        };

        this.curChildrenIndex = 0;
        this.curEventIndex = 0;

        this.chooseEventBtn = this.chooseEventBtn.bind(this);
        this.expandedBtn = this.expandedBtn.bind(this);
        this.addEventBtn = this.addEventBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);

        this.getConditionOption = this.getConditionOption.bind(this);   //获取触发条件

        this.setTreeList = this.setTreeList.bind(this);   //获取事件面板树
        this.getJudgeValType =this.getJudgeValType.bind(this);
        this.getCompareValOption =this.getCompareValOption.bind(this);

        this.getSelectFull = this.getSelectFull.bind(this);
        this.getSelectHalf = this.getSelectHalf.bind(this);
        this.getSwitchHalf = this.getSwitchHalf.bind(this);
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
                  operationManager: {  //下拉框显现管理
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
            this.setTreeList(widget.allWidgets);

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
    }


    setTreeList(allWidgets){
        let treeList=[];
        allWidgets.map((v,index)=>{
             let eventList=[];
            if(v.props.eventTree){
                v.props.eventTree.map((v2,i2)=>{
                    let judgeArr =[];
                    if(v2.children){
                        v2.children.map((v3,i3)=>{
                            judgeArr.push({
                                judgeObjFlag:v3.judgeObjFlag,  //改成obj
                                judgeValFlag:v3.judgeValFlag, 
                                compareFlag:v3.compareFlag,
                                compareObjFlag:v3.compareObjFlag,  //改成obj
                                compareValFlag:v3.compareValFlag
                            });
                        });
                    }
                    eventList.push({
                        name:v2.conFlag,
                        judgeFlag:'and',
                        judgeArr:judgeArr
                    });
                });
            }
            treeList.push(eventList);
        });
        this.setState({treeList:treeList});
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

    getCompareValOption(nameArr){
        let judgeValType =this.state.eventList[this.curEventIndex].children[this.curChildrenIndex].judgeValType;
        let propArr =this.state.eventList[this.curEventIndex].children[this.curChildrenIndex].propArr;
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

    getSelectFull(){
      return   <div className='dropDown-input dropDown-input-select dropDown-input-full'>
            <input defaultValue='碰撞对象'  className='dropDown-input-content' />
            <div className='dropDown-icon-select dropDown-select-down'></div>
        </div>
    }

    getSelectHalf(){
      return    <div className='dropDown-input2 dropDown-input-full '>
            <div className='dropDown-input-txt-half'>中心距离</div>
            <div className='dropDown-input-half'>
                <input defaultValue='中心'   className='dropDown-input-content' />
            </div>
            <div className='dropDown-icon-select dropDown-select-down'></div>
        </div>
    }

    getSwitchHalf(){
        return   <div className='dropDown-input2 dropDown-input-full '>
            <div className='dropDown-input-txt-half'>优化速度</div>
            <div className='dropDown-switch dropDown-switch-right '>
                <div className='on'>ON</div>
                <div className='off'>OFF</div>
            </div>
        </div>
    }

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

        let key = this.curChildrenIndex;

        if (flag == 'conFlag') {
            eventList[this.curEventIndex][flag] = e.item.props.object;
        } else if(flag == 'logicalFlag'){
            eventList[this.curEventIndex].logicalFlag = e.item.props.object;
        }else {
            eventList[this.curEventIndex].children[key][flag] = e.item.props.object;
        }

        this.setState({eventList: eventList});

        let arrHidden;
        let isRun = true;

        let initFlag = this.state.eventList[this.curEventIndex].children[this.curChildrenIndex]; //初始化

        let chooseEventClassName = this.getClassNameByobjName(e.item.props.object);


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

                this.setState({judgeValOption: judgeValOption});

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
                initFlag.compareValFlag = '比较';
                initFlag.operationManager = {
                    arrHidden: arrHidden
                }

                //设定选中比较值的类型
                initFlag.judgeValType=this.getJudgeValType(e.item.props.object);
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
                    compareValOption =this.getCompareValOption(propObj.nameArr);

                    this.setState({compareValOption: compareValOption});

                    initFlag.compareValOption =compareValOption;

                    initFlag.compareValFlag = '比较值';
                    initFlag.operationManager = {
                        arrHidden: arrHidden
                    }
                }
                //初始化后一个
                break;
            default :
                isRun = false;
        }

        if (isRun) {
            let eventList = this.state.eventList;
            eventList[this.curEventIndex].children[this.curChildrenIndex] = initFlag;
            this.setState({eventList: eventList});
        }
    }

    setCurChildrenIndex(index,eventIndex,e){
        this.curChildrenIndex =index;
        this.curEventIndex=eventIndex;
    }

    inputChange(val,event) {
        let eventList = this.state.eventList;
        eventList[this.curEventIndex].children[this.curChildrenIndex][val] = event.target.value;
        this.setState({
            eventList: eventList
        });
    }
    render() {
        let menuList = (flag)=> {
            let option = flag.replace('Flag', 'Option');
            return (<Menu className='dropDownMenu' onClick={this.onMenuClick.bind(this,flag)}>
                {
                    this.state[option].map((v, i)=> {
                        return <MenuItem key={i} object={v}>{v}</MenuItem>;
                    })
                }
            </Menu>)
        }
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
                                            overlay={menuList('conFlag')}
                                            onClick={this.setCurChildrenIndex.bind(this,null,i)}
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
                                    :   <div className={$class('zhong',{'hidden':v.zhongHidden})}>
                                    {
                                        v.children.map((v1,i1)=>{
                                            return  <div className="list f--hlc" key={i1}>
                                                <span className="supplement-line" />
                                                <div className={$class('dropDown-layer middle',{'hidden':v1.operationManager.arrHidden[0]})} >
                                                    <Dropdown
                                                        overlay={ menuList('logicalFlag')}
                                                        onClick={this.setCurChildrenIndex.bind(this,i1,i)}
                                                        getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                        trigger={['click']}>
                                                        <div className='title f--hlc'>
                                                            {v.logicalFlag}
                                                            <span className='icon' /></div>
                                                    </Dropdown>
                                                </div>

                                                <div className={$class('dropDown-layer long',{'hidden':v1.operationManager.arrHidden[1]})} >
                                                    <Dropdown
                                                        overlay={menuList('judgeObjFlag')}
                                                        onClick={this.setCurChildrenIndex.bind(this,i1,i)}
                                                        getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                        trigger={['click']}>
                                                        <div   className={$class('title f--hlc',{'title-gray':v1.judgeObjFlag==this.state.judgeObjFlag})} >
                                                            <input value= {v1.judgeObjFlag}  onChange={this.inputChange.bind(this,'judgeObjFlag')}  className='judgeObjFlag-input'/>
                                                            <span className='icon' /></div>
                                                    </Dropdown>
                                                    <div className="dropDown"></div>
                                                </div>

                                                <div className={$class('dropDown-layer long',{'hidden':v1.operationManager.arrHidden[2]})} >
                                                    <Dropdown
                                                        overlay={menuList('judgeValFlag')}
                                                        onClick={this.setCurChildrenIndex.bind(this,i1,i)}
                                                        getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                        trigger={['click']}>
                                                        <div    className={$class('title f--hlc',{'title-gray':v1.judgeValFlag==this.state.judgeValFlag})} >

                                                            <input value= {v1.judgeValFlag}  onChange={this.inputChange.bind(this,'judgeValFlag')}  className='judgeValFlag-input'/>
                                                            <span className='icon' /></div>
                                                    </Dropdown>
                                                    <div className="dropDown"></div>
                                                </div>
                                                <div className={$class('dropDown-layer middle',{'hidden':v1.operationManager.arrHidden[3]})} >
                                                    <Dropdown
                                                        overlay={menuList('compareFlag')}
                                                        onClick={this.setCurChildrenIndex.bind(this,i1,i)}
                                                        getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                        trigger={['click']}>
                                                        <div className='title f--hlc'>
                                                            {v1.compareFlag}
                                                            <span className='icon' /></div>
                                                    </Dropdown>
                                                    <div className="dropDown"></div>
                                                </div>

                                                <div className={$class('dropDown-layer long',{'hidden':v1.operationManager.arrHidden[4]})} >
                                                    <Dropdown
                                                        overlay={menuList('compareObjFlag')}
                                                        onClick={this.setCurChildrenIndex.bind(this,i1,i)}
                                                        getPopupContainer={() => document.getElementById('event-item-'+v.eid)}
                                                        trigger={['click']}>
                                                        <div  className={$class('title f--hlc',{'title-gray':v1.compareObjFlag==this.state.compareObjFlag})} >
                                                            <input value= {v1.compareObjFlag}  onChange={this.inputChange.bind(this,'compareObjFlag')}  className='compareObjFlag-input'/>
                                                            <span className='icon' /></div>
                                                    </Dropdown>
                                                    <div className="dropDown"></div>
                                                </div>
                                                <div className={$class('dropDown-layer long',{'hidden':v1.operationManager.arrHidden[5]})} >
                                                    <Dropdown
                                                        overlay={menuList('compareValFlag')}
                                                        onClick={this.setCurChildrenIndex.bind(this,i1,i)}
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

