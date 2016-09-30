//事件
import React from 'react';
import $class from 'classnames'

import Property from './Property'
import WidgetStore from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'
import  {propertyMap} from '../PropertyMap'

import { Menu, Dropdown, Icon } from 'antd';
const MenuItem = Menu.Item;


class Event extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            expanded: true,
            selectWidget:this.props.widget,
            activeKey:this.props.activeKey,  //当前激活事件的key

            specialObject:['计数器','文本','strVar','intVar','输入框'],

            conOption:[],
            logicalOption:['and','or'],  //下拉选项
            judgeObjOption:['计数器','文本','strVar','intVar','输入框','图片'],
            judgeValOption:['计算1','计算2'],
            compareOption:['=','>','<','!=','>=','<='],
            compareObjOption:['计数器','文本','strVar','intVar','输入框','图片'],
            compareValOption:['比较值1','比较值2'],


            conFlag:'触发条件',  //初始值
            logicalFlag:'and',
            judgeObjFlag:'判断对象',
            judgeValFlag:'计算',
            compareFlag:'=',
            compareObjFlag:'比较对象',
            compareValFlag:'比较',

            operationManager: {  //下拉框显现管理
                zhongHidden:true,
                curShow:-1,
                arrHidden: [true,true,true,true,true,true]  //逻辑运算符,判断对象,判断值,比较运算符,比较对象,比较值
            }
        };


        this.chooseEventBtn = this.chooseEventBtn.bind(this);
        this.expandedBtn = this.expandedBtn.bind(this);
        this.addEventBtn = this.addEventBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);

        this.getSelectOption = this.getSelectOption.bind(this);   //获取触发条件



        this.plusOperation=this.plusOperation.bind(this);                   //添加下拉框
        this.deleteOperation=this.deleteOperation.bind(this);              //删除下拉框

        this.getSelectFull =this.getSelectFull.bind(this);
        this.getSelectHalf =this.getSelectHalf.bind(this);
        this.getSwitchHalf =this.getSwitchHalf.bind(this);


    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            activeKey:this.props.activeKey
        })
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
        //获取当前事件对象的触发条件
        this.getSelectOption();
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

        if (widget.selectWidget) {
            this.setState({
                selectWidget: widget.selectWidget
            }, ()=> {
                this.getSelectOption();
            });
        }

    }


    chooseEventBtn(nid){
        this.props.chooseEventBtn(nid);
    }

    addEventBtn(e) {
        e.stopPropagation();
        WidgetActions['addEvent']();

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

    getSelectOption(){
        let aOption=[];
        let className = this.state.selectWidget.className;


        propertyMap[className].map((item,index)=>{
            if(item.isEvent === true){
                aOption.push(item.name);
            }
        });
        this.setState({conOption:aOption});
    }

    plusOperation(){

    }
    deleteOperation(){
        //初始化六项
        this.setState({
            logicalFlag:'and',
            judgeObjFlag:'判断对象',
            judgeValFlag:'计算',
            compareFlag:'=',
            compareObjFlag:'比较对象',
            compareValFlag:'比较',

            operationManager:{
                zhongHidden:true,
                curShow:-1,
                arrHidden:[true,true,true,true,true,true]
            }
        });
    }

    onMenuClick(flag,e){
        e.domEvent.stopPropagation();
        let obj={};
        obj[flag] =e.item.props.object;
        this.setState(obj);

        let curShow;
        let arrHidden;
        let isRun=true;
        let initFlag={}; //初始化

        switch (flag){

            case 'conFlag':
                arrHidden=[false,false,true,true,true,true];
                initFlag={
                    operationManager:{
                        zhongHidden:false,
                        arrHidden: arrHidden
                    }
                }
                break;

            case 'judgeObjFlag':

                if(this.state.specialObject.indexOf(e.item.props.object)>=0){
                    arrHidden=[false,false,true,false,false,true];
                }else{
                    arrHidden=[false,false,false,true,true,true];
                }
                //初始化后四个
                initFlag={
                    judgeValFlag:'计算',
                    compareFlag:'=',
                    compareObjFlag:'比较对象',
                    compareValFlag:'比较',
                    operationManager:{
                        zhongHidden: false,
                        arrHidden: arrHidden
                    }
                }
                break;
            case 'judgeValFlag':
                arrHidden=[false,false,false,false,false,true];
                //初始化后三个
                initFlag={
                    compareFlag:'=',
                    compareObjFlag:'比较对象',
                    compareValFlag:'比较',
                    operationManager:{
                        zhongHidden: false,
                        arrHidden: arrHidden
                    }
                }
                break;
            case 'compareObjFlag':
                 arrHidden =this.state.operationManager.arrHidden;
                if (this.state.specialObject.indexOf(e.item.props.object) >= 0) {
                    arrHidden[5]=true;
                }else{
                    arrHidden[5]=false;
                }
                //初始化后一个
                initFlag={
                    compareValFlag:'比较',
                    operationManager:{
                        zhongHidden: false,
                        arrHidden: arrHidden
                    }
                }
                break;
           default : isRun =false;
        }

        if(isRun) {
            this.setState(initFlag);
        }
    }
    render() {

        let menuList = (flag)=>{
            let option = flag.replace('Flag','Option');
           return (<Menu className='dropDownMenu' onClick={this.onMenuClick.bind(this,flag)}>
                { this.state[option].map((v,i)=>{
                    return <MenuItem key={i} object={v} >{v}</MenuItem>;
                })}
            </Menu>)
        }



        let content = ((v,i)=>{
            return  <div className='item f--h' key={i} id={'event-item-'+v.eid}>
                <span className='left-line' />
                <div className='item-main flex-1'>
                    <div className='item-header f--h'>
                        <span className='close-line' />
                        <div className='item-title flex-1 f--h'>
                            <div className='left'>
                                <div className='left-layer  f--h'>
                                    <span className='title-icon' />
                                    <div className='dropDown-layer long'>
                                        <Dropdown
                                            overlay={menuList('conFlag')}
                                            trigger={['click']}>
                                            <div className='title f--hlc'>
                                                {this.state.conFlag}
                                                <span className='icon' /></div>
                                        </Dropdown>
                                        <div className='dropDown'></div>
                                    </div>
                                </div>
                            </div>
                            {

                                   <div className={$class('zhong',{'hidden':this.state.operationManager.zhongHidden})}>
                                              <div className="list f--hlc" >
                                                <span className="supplement-line" />
                                                <div className={$class('dropDown-layer middle',{'hidden':this.state.operationManager.arrHidden[0]})} >
                                                        <Dropdown
                                                            overlay={ menuList('logicalFlag')}
                                                            trigger={['click']}>
                                                            <div className='title f--hlc'>
                                                                {this.state.logicalFlag}
                                                                <span className='icon' /></div>
                                                        </Dropdown>
                                                </div>

                                                  <div className={$class('dropDown-layer long',{'hidden':this.state.operationManager.arrHidden[1]})} >

                                                      <Dropdown
                                                          overlay={menuList('judgeObjFlag')}
                                                          trigger={['click']}>
                                                          <div className='title f--hlc'>
                                                              {this.state.judgeObjFlag}
                                                              <span className='icon' /></div>
                                                      </Dropdown>

                                                    <div className="dropDown"></div>
                                                </div>

                                                  <div className={$class('dropDown-layer long',{'hidden':this.state.operationManager.arrHidden[2]})} >

                                                      <Dropdown
                                                          overlay={menuList('judgeValFlag')}
                                                          trigger={['click']}>
                                                          <div className='title f--hlc'>
                                                              {this.state.judgeValFlag}
                                                              <span className='icon' /></div>
                                                      </Dropdown>
                                                    <div className="dropDown"></div>
                                                </div>

                                                  <div className={$class('dropDown-layer middle',{'hidden':this.state.operationManager.arrHidden[3]})} >

                                                      <Dropdown
                                                          overlay={menuList('compareFlag')}
                                                          trigger={['click']}>
                                                          <div className='title f--hlc'>
                                                              {this.state.compareFlag}
                                                              <span className='icon' /></div>
                                                      </Dropdown>
                                                    <div className="dropDown"></div>
                                                </div>

                                                  <div className={$class('dropDown-layer long',{'hidden':this.state.operationManager.arrHidden[4]})} >
                                                      <Dropdown
                                                          overlay={menuList('compareObjFlag')}
                                                          trigger={['click']}>
                                                          <div className='title f--hlc'>
                                                              {this.state.compareObjFlag}
                                                              <span className='icon' /></div>
                                                      </Dropdown>
                                                      <div className="dropDown"></div>
                                                  </div>

                                                  <div className={$class('dropDown-layer long',{'hidden':this.state.operationManager.arrHidden[5]})} >

                                                      <Dropdown
                                                          overlay={menuList('compareValFlag')}
                                                          trigger={['click']}>
                                                          <div className='title f--hlc'>
                                                              {this.state.compareValFlag}
                                                              <span className='icon' /></div>
                                                      </Dropdown>
                                                      <div className="dropDown"></div>
                                                  </div>

                                                <span className={$class('close-btn')}      onClick={this.deleteOperation} />
                                            </div>
                                </div>
                            }
                            <div className='right flex-1'>
                                <div className='right-layer'>
                                    <div className={$class('plus-btn')}   onClick={this.plusOperation}>
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
                        !this.props.eventList || this.props.eventList.length===0
                            ? null
                            : this.props.eventList.map(content)
                    }
                </div>
            </div>
        );
    }
}

module.exports = Event;

