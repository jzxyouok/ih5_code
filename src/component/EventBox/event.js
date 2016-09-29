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
            bindOption:['and','or'],  //下拉选项
            objectOption:['计数器','文本','strVar','intVar','输入框','图片'],
            actionOption:['计算1','计算2'],
            judgmentOption:['=','>','<','!=','>=','<='],
            valueOption:['计数器','文本','strVar','intVar','输入框','图片'],

            conFlag:null,  //初始值
            bindFlag:'and',
            objectFlag:'请选择判断对象',
            actionFlag:'计算',
            judgmentFlag:'=',
            valueFlag:'请选择比较对象',

            operationManager: {  //下拉框显现管理
                zhongHidden:true,
                curShow:-1,
                showArr: [true,true,true,true,true]
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
        let count = this.state.operationManager.curShow;
        let arr =this.state.operationManager.showArr;
        if(count<4) {
            ++count;
        }

        switch (count){
            case 0:
                count=1;
                arr=[false,false,true,true,true,true];
                break;

            case 2:

                if(this.state.specialObject.indexOf(this.state.objectFlag)>=0){
                    count=4;
                    arr=[false,false,true,false,false,true];
                }else{

                    arr=[false,false,false,true,true,true];
                }

                break;
            case 3:

                arr=[false,false,false,false,true,true];

                break;
            case 4:
                if(this.state.specialObject.indexOf(this.state.valueFlag)<0){

                    arr=[false,false,true,false,false,false];
                }else{
                    arr=[false,false,true,false,false,true];
                }
                break;
        }
        this.setState({
                operationManager:{
                   zhongHidden:false,
                   curShow:count,
                   showArr:arr
               }
            });
    }
    deleteOperation(){
        this.setState({
            operationManager:{
                zhongHidden:true,
                curShow:-1,
                showArr:[true,true,true,true,true]
            }
        });
    }


    onMenuClick(flag,e){
        e.domEvent.stopPropagation();
        let obj={};
        obj[flag] =e.item.props.object;
        this.setState(obj);
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
                                                { this.state.conFlag==null? '触发条件': this.state.conFlag}
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
                                                <div className={$class('dropDown-layer short',{'hidden':this.state.operationManager.showArr[0]})} >
                                                        <Dropdown
                                                            overlay={ menuList('bindFlag')}
                                                            trigger={['click']}>
                                                            <div className='title f--hlc'>
                                                                {this.state.bindFlag}
                                                                <span className='icon' /></div>
                                                        </Dropdown>
                                                </div>

                                                  <div className={$class('dropDown-layer long',{'hidden':this.state.operationManager.showArr[1]})} >

                                                      <Dropdown
                                                          overlay={menuList('objectFlag')}
                                                          trigger={['click']}>
                                                          <div className='title f--hlc'>
                                                              {this.state.objectFlag}
                                                              <span className='icon' /></div>
                                                      </Dropdown>

                                                    <div className="dropDown"></div>
                                                </div>

                                                  <div className={$class('dropDown-layer long',{'hidden':this.state.operationManager.showArr[2]})} >

                                                      <Dropdown
                                                          overlay={menuList('actionFlag')}
                                                          trigger={['click']}>
                                                          <div className='title f--hlc'>
                                                              {this.state.actionFlag}
                                                              <span className='icon' /></div>
                                                      </Dropdown>
                                                    <div className="dropDown"></div>
                                                </div>

                                                  <div className={$class('dropDown-layer short',{'hidden':this.state.operationManager.showArr[3]})} >

                                                      <Dropdown
                                                          overlay={menuList('judgmentFlag')}
                                                          trigger={['click']}>
                                                          <div className='title f--hlc'>
                                                              {this.state.judgmentFlag}
                                                              <span className='icon' /></div>
                                                      </Dropdown>
                                                    <div className="dropDown"></div>
                                                </div>



                                                  <div className={$class('dropDown-layer long',{'hidden':this.state.operationManager.showArr[4]})} >
                                                      <Dropdown
                                                          overlay={menuList('valueFlag')}
                                                          trigger={['click']}>
                                                          <div className='title f--hlc'>
                                                              {this.state.valueFlag}
                                                              <span className='icon' /></div>
                                                      </Dropdown>
                                                      <div className="dropDown"></div>
                                                  </div>

                                                <span className="close-btn" onClick={this.deleteOperation} />
                                            </div>
                                </div>
                            }
                            <div className='right flex-1'>
                                <div className='right-layer'>
                                    <div className='plus-btn' onClick={this.plusOperation}>
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

