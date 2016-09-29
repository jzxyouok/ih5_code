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
            selectOption:[],
            activeKey:this.props.activeKey,  //当前激活事件的key
            currentConditionObject:null
        };



        this.eventTreeList=[];
        this.curClassName =null

        this.chooseEventBtn = this.chooseEventBtn.bind(this);
        this.expandedBtn = this.expandedBtn.bind(this);
        this.addEventBtn = this.addEventBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);

        this.getSelectOption = this.getSelectOption.bind(this);
        this.onConditionSelectObject=this.onConditionSelectObject.bind(this);


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

        console.log(widget);

        //触发更新目标对象列表
        if(widget.redrawEventTree){
            if(this.props.wKey === this.props.activeKey) {
                this.forceUpdate();
            }
        }

        if(widget.selectWidget){
            this.setState({
                selectWidget:widget.selectWidget
            });

            this.getSelectOption();
        }

    }

    onConditionSelectObject(e){
        e.domEvent.stopPropagation();
        this.setState({
            currentConditionObject: e.item.props.object
        });
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
                aOption.push(item);
            }
        });
        this.setState({selectOption:aOption});
    }

    render() {

        let actionCondition = (
            <Menu className='dropDownMenu' onClick={this.onConditionSelectObject}>
                { this.state.selectOption.map((v,i)=>{
                    return <MenuItem key={i} object={v} >{v.name}</MenuItem>;
                })}
            </Menu>
        );

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
                                            overlay={actionCondition}
                                            trigger={['click']}>
                                            <div className='title f--hlc'>
                                                { this.state.currentConditionObject==null? '触发条件': this.state.currentConditionObject.name}
                                                <span className='icon' /></div>
                                        </Dropdown>
                                        <div className='dropDown'></div>
                                    </div>
                                </div>
                            </div>
                            {
                                !v.children || v.children.length === 0
                                    ? null
                                    : <div className="zhong">
                                    {
                                        v.children.map((v1,i1)=>{
                                            return  <div className="list f--hlc" key={i1}>
                                                <span className="supplement-line" />
                                                <div className="dropDown-layer short">
                                                    <div className="title f--hlc">
                                                        { v1.bind }
                                                        <span className="icon" />
                                                    </div>
                                                    <div className="dropDown"></div>
                                                </div>

                                                <div className="dropDown-layer long">
                                                    <div className="title f--hlc">
                                                        { v1.object }
                                                        <span className="icon" />
                                                    </div>
                                                    <div className="dropDown"></div>
                                                </div>

                                                <div className="dropDown-layer long">
                                                    <div className="title f--hlc">
                                                        { v1.action }
                                                        <span className="icon" />
                                                    </div>
                                                    <div className="dropDown"></div>
                                                </div>

                                                <div className="dropDown-layer short">
                                                    <div className="title f--hlc">
                                                        { v1.judgment }
                                                        <span className="icon" />
                                                    </div>
                                                    <div className="dropDown"></div>
                                                </div>

                                                {
                                                    v1.calculator
                                                        ? <div className="number f--hlc">
                                                        <input />
                                                        <div className="number-icon flex-1">
                                                            <div className="shang-btn"><span/></div>
                                                            <div className="xia-btn"><span/></div>
                                                        </div>
                                                    </div>

                                                        : <div className="dropDown-layer middle">
                                                        <div className="title f--hlc">
                                                            { v1.value }
                                                            <span className="icon" />
                                                        </div>
                                                        <div className="dropDown"></div>
                                                    </div>
                                                }

                                                <span className="close-btn" />
                                            </div>
                                        })
                                    }
                                </div>
                            }
                            <div className='right flex-1'>
                                <div className='right-layer'>
                                    <div className='plus-btn'>
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
                                                 wid={this.props.wKey}
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

