//事件属性框
import React from 'react';
import $class from 'classnames';
import Event from './Event';
import {eventTempData} from './tempData';
import { Input } from 'antd';
import WidgetStore, {keepType}  from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'

class EventBox extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            keepIt : false,
            activeKey: -1,
            selectWidget: null,
            treeList: [],
            objectList:[],
            eventTreeList: [],
            showObjList: false,  //是否显示对象列表
        };
        this.eventData = eventTempData;

        this.chooseEventBtn = this.chooseEventBtn.bind(this);
        this.keepBtn = this.keepBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);

        this.doGetNoEventObjList = this.doGetNoEventObjList.bind(this);
        this.doGetSearchObjList = this.doGetSearchObjList.bind(this);
        this.onShowNoEventObjList = this.onShowNoEventObjList.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.reorderEventTreeList());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if(!widget) {
            return;
        }
        if(widget.initTree){
            this.setState({
                treeList: widget.initTree
            });
        }
        if(widget.redrawEventTreeList) {
            this.forceUpdate();
        }
        if(widget.eventTreeList){
            this.setState({
                eventTreeList: widget.eventTreeList
            });
        } else if(widget.selectWidget) {
            this.setState({
                selectWidget: widget.widget
            });
        } else if(widget.activeEventTreeKey) {
            this.setState({
                activeKey: widget.activeEventTreeKey.key
            });
        } else if(widget.allWidgets){
            this.setState({
                objectList: widget.allWidgets
            })
        }
        if(widget.historyPropertiesUpdate){
            this.forceUpdate();
        }
    }

    chooseEventBtn(nid, data){
        if(this.state.activeKey !== nid) {
            this.setState({
                activeKey: nid
            }, ()=>{
                //触发选择widget并选择当前event
                WidgetActions['selectWidget'](data, true, keepType.event);
                WidgetActions['activeEventTree'](nid);
            });
        }
    }

    doGetNoEventObjList() {
        let noEventObjList = [];
        if(this.state.objectList) {
            this.state.objectList.forEach((v,i)=>{
                if(!(v.props.eventTree&&v.props.eventTree.length>0)&&v.className!=='var') {
                    noEventObjList.push(v);
                }
            });
        }
        return noEventObjList;
    }

    doGetSearchObjList(search) {
        let searchObjList = [];
        if(this.state.objectList) {
            this.state.objectList.forEach((v,i)=>{
                if(!(v.props.eventTree&&v.props.eventTree.length>0)&&v.className!=='var') {
                    if(v.props.name.indexOf(search)>=0) {
                        searchObjList.push(v);
                    }
                }
            });
        }
        return searchObjList;
    }

    onShowNoEventObjList(e) {

    };

    keepBtn(){
        this.setState({
            keepIt : !this.state.keepIt
        })
    }

    render() {
        let currentObj = WidgetStore.getWidgetByKey(this.state.activeKey);
        return (
            <div className={$class('EventBox',{'keep':this.state.keepIt}, {'hidden':this.props.isHidden})}
                 style={{ left : this.props.expanded? '65px':'37px'}}
                 id='EventBox'>
                <div className='EB--title f--hlc'>
                    <div className='f--hlc flex-1 EB--title-wrap'>
                        {
                            !(this.state.treeList&&this.state.treeList.length>0)
                                ? null
                                : this.state.treeList.map((v,i)=>{
                                let name = v.tree.props.name+'事件';
                                return (<span className={$class('EB--title-name',
                                    {'active':currentObj&&currentObj.rootWidget&&currentObj.rootWidget.key === v.tree.key})}
                                              onClick={this.chooseEventBtn.bind(this, v.tree.key, v.tree)}
                                              key={i}>{name}</span>);
                            })
                        }
                    </div>
                    {/*<span className='flex-1'>事件属性</span>*/}
                    <div className="EB--title-search-wrap f--hlc">
                        <div className="search-group f--hlc">
                            <button className="search-btn" onClick={this.onShowNoEventObjList} title='添加对象事件'>
                                <div className='btn-icon'>
                                    <span className='heng'/><span  className='shu'/>
                                </div>
                            </button>
                            <Input className="search-input"
                                   placeholder="搜索对象"
                                   size="small"/>
                        </div>
                        <div>

                        </div>
                    </div>
                    <button className='btn btn-clear' title='收起' onClick={this.keepBtn} />
                </div>

                <div className='EB--content-layer' id='EBContentLayer'>
                    <div className='EB--content'>
                        {
                            !this.state.eventTreeList || this.state.eventTreeList.length === 0
                                ? null
                                : this.state.eventTreeList.map((v,i)=>{
                                    return <Event key={i}
                                                  widget={v}
                                                  eventList={v.props.eventTree}
                                                  name={v.props.name}
                                                  wKey={v.key}
                                                  activeKey={this.state.activeKey}
                                                  chooseEventBtn={this.chooseEventBtn.bind(this, v.key, v)} />
                                  })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = EventBox;
