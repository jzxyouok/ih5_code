//事件属性框
import React from 'react';
import $class from 'classnames';
import Event from './Event';
import {eventTempData} from './tempData';
import { Input } from 'antd';
import WidgetStore, {keepType, isCustomizeWidget, dataType}  from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'
import ComponentPanel from '../ComponentPanel';
import DbHeaderStores from '../../stores/DbHeader';

import {getSize} from '../../utils/getSize'
import {imgServer} from '../../api/BaseApi';

const objListType = {
    default: 0,
    noEvent: 1,
    search: 2,
};
const imgServerPrefix = imgServer;

class EventBox extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            keepIt : false,
            activeKey: null,
            selectWidget: null,
            eventTreeList: [],
            treeList: [],  //顶部需用到
            allWidgetList:[],//可选widget的列表
            objList: [],//下来框的
            objListType: objListType.default, //default的时候不显示
            dbList: [], //数据库列表
            AllDbList:[],
        };
        this.eventData = eventTempData;
        this.totalWidth = 0;

        this.chooseEventBtn = this.chooseEventBtn.bind(this);
        this.keepBtn = this.keepBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);

        this.doGetNoEventObjList = this.doGetNoEventObjList.bind(this);
        this.doGetSearchObjList = this.doGetSearchObjList.bind(this);

        this.onClickShowNoEventObjList = this.onClickShowNoEventObjList.bind(this);
        this.onSearchPhraseChange = this.onSearchPhraseChange.bind(this);
        this.onClickObj = this.onClickObj.bind(this);
        this.onBlur = this.onBlur.bind(this);

        this.getObjIcon = this.getObjIcon.bind(this);
        this.setTitleMaxWidth = this.setTitleMaxWidth.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        DbHeaderStores.listen(this.DbHeaderData.bind(this));
        this.onStatusChange(WidgetStore.reorderEventTreeList());
        window.addEventListener('click', this.onBlur);
    }

    componentWillUnmount() {
        this.unsubscribe();
        DbHeaderStores.removeListener(this.DbHeaderData.bind(this));
        window.removeEventListener('click', this.onBlur);
    }

    onStatusChange(widget) {
        if(!widget) {
            return;
        }
        if(widget.initTree){
            this.setState({
                treeList: widget.initTree
            }, ()=>{
                if(this.state.treeList&&this.state.treeList.length>0) {
                    this.totalWidth = 0;
                    this.state.treeList.forEach((v,i)=>{
                        this.setTitleMaxWidth(v,i);
                    });
                }
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
            let dbList = [];
            widget.allWidgets.map((v,i)=>{
                if(v.className == "db"){
                    let data = {};
                    if(v.node.dbType == "shareDb"){
                        this.state.AllDbList.map((v1,i1)=>{
                            if(v1.id == v.props.dbid){
                                data = v1;
                                dbList.push(data);
                                this.setState({
                                    dbList : dbList
                                })
                            }
                        })
                    }
                    else {
                        WidgetActions['ajaxSend'](null, 'POST', 'app/dbGetParm/' + v.props.dbid, null, null, function(text) {
                            var result = JSON.parse(text);
                            //console.log(result);
                            if (result['header']) {
                                data['id'] = v.props.dbid;
                                data['name'] = v.props.name;
                                data['header'] = result['header'];
                            }
                            else {
                                data['id'] = v.props.dbid;
                                data['name'] = v.props.name;
                            }
                            dbList.push(data);
                            this.setState({
                                dbList : dbList
                            })
                        }.bind(this));
                    }
                }
            });

            this.setState({
                allWidgetList: widget.allWidgets
            })
        }
        if(widget.historyPropertiesUpdate){
            this.forceUpdate();
        }
    }

    DbHeaderData(data,bool){
        this.setState({
            AllDbList : data
        })
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
        //更新触发条件
        WidgetActions['updateConOptions'](nid);
    }

    doGetNoEventObjList() {
        let noEventObjList = [];
        if(this.state.allWidgetList) {
            this.state.allWidgetList.forEach((v,i)=>{
                if(v.props.block) {
                    if(!(v.props.block.eventTree&&v.props.block.eventTree.length>0)&&v.className!=='var') {
                        noEventObjList.push(v);
                    }
                } else {
                    if(!(v.props.eventTree&&v.props.eventTree.length>0)&&v.className!=='var') {
                        noEventObjList.push(v);
                    }
                }
            });
        }
        return noEventObjList;
    }

    doGetSearchObjList(search) {
        let searchObjList = [];
        if(this.state.allWidgetList) {
            this.state.allWidgetList.forEach((v,i)=>{
                if(v.props.block) {
                    if(v.props.block.eventTree&&v.props.block.eventTree.length>0&&v.className!=='var') {
                        if(v.props.block.name.indexOf(search)>=0) {
                            searchObjList.push(v);
                        }
                    }
                } else {
                    if(v.props.eventTree&&v.props.eventTree.length>0&&v.className!=='var') {
                        if(v.props.name.indexOf(search)>=0) {
                            searchObjList.push(v);
                        }
                    }
                }
            });
        }
        return searchObjList;
    }

    onClickShowNoEventObjList(e) {
        e.stopPropagation();
        if(this.state.objListType !== objListType.noEvent) {
            let list = this.doGetNoEventObjList();
            this.setState({
                objListType: objListType.noEvent,
                objList: list
            });
        } else {
            this.setState({
                objListType: objListType.default,
                objList: []
            });
        }
    };

    onSearchPhraseChange(e) {
        e.stopPropagation();
        let search = e.target.value;
        let list = this.doGetSearchObjList(search);
        let type = objListType.search;
        if(search===null || search==='') {
            type = objListType.default;
        }
        this.setState({
            objListType: type,
            objList: list
        });
    };

    onClickObj(key, data, e) {
        e.stopPropagation();
        switch(this.state.objListType){
            case objListType.noEvent:
                WidgetActions['selectWidget'](data, true, keepType.event);
                WidgetActions['initEventTree']();
                break;
            case objListType.search:
                if(key !== this.state.activeKey) {
                    this.chooseEventBtn(key, data);
                }
                break;
            default:
                break;
        }
        this.onBlur();
    }

    onBlur() {
        this.setState({
            objListType: objListType.default,
            objList: []
        });
    };

    keepBtn(){
        this.setState({
            keepIt : !this.state.keepIt
        })
    }

    getObjIcon(obj){
        let pic = null;
        let picIsImage = false;
        this.refs.ComponentPanel.panels[0].cplist.map((v1,i2)=>{
            if(obj.className === 'root') {
                if(obj.props.name.substr(0,1)==='_') {
                    pic = 'component-icon';
                } else {
                    pic = 'stage-icon';
                }
            }
            if(isCustomizeWidget(obj.className)) {
                pic = 'component-icon';
            }
            else if(obj.className == 'db'){
                if(obj.node.dbType == "shareDb"){
                    pic = 'shareDb-icon';
                }
                else {
                    pic = 'personalDb-icon';
                }
            }
            else if(obj.className === 'data'){
                if(obj.props.type === dataType.twoDArr) {
                    pic = 'twoDArr-icon';
                } else if (obj.props.type === dataType.oneDArr) {
                    pic = 'oneDArr-icon';
                }
            }
            else if(obj.className === 'sock'){
                pic = 'sock-icon';
            }
            else if (v1.className === obj.className){
                if(obj.className === 'image' || obj.className === 'imagelist') {
                    if(obj.props.link !== undefined &&
                        obj.rootWidget.imageList&&
                        obj.rootWidget.imageList.length>obj.props.link){
                        if(obj.className === 'imagelist') {
                            pic = obj.rootWidget.imageList[obj.props.link][0];
                        } else {
                            pic = obj.rootWidget.imageList[obj.props.link];
                        }
                        if(pic.substring(0,5) !== 'data:') {
                            pic = imgServerPrefix+pic;
                        }
                        picIsImage = true;
                    } else {
                        pic = v1.icon;
                    }
                } else {
                    pic = v1.icon;
                }
            }
            if(obj.props.block) {
                pic = 'component-icon';
            }
        });
        return {picIsImage:picIsImage, pic:pic};
    }

    setTitleMaxWidth (v,i) {
        let name = v.tree.props.name+'事件';
        let sensor = document.createElement('span');
        sensor.innerText = name;
        sensor.style.display = 'none';
        sensor.style.fontSize = '14px';
        document.body.appendChild(sensor);
        let width = getSize(sensor).width+2;
        if(sensor&&sensor.parentElement) {
            sensor.parentElement.removeChild(sensor);
        }
        if(i!==0) {
            this.totalWidth += width+25;
        } else {
            this.totalWidth += width+24;
        }
        if(i===this.state.treeList.length-1) {
            if(this.totalWidth>=572) {
                let avg = 572/this.state.treeList.length;
                this.state.treeList.forEach((v1,i1)=>{
                    this.refs['EBTitle'+i1].style.maxWidth = avg+'px';
                });
            }
        }
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
                                return (<div className={$class('EB--title-name',
                                        {'active':currentObj&&currentObj.rootWidget&&currentObj.rootWidget.key === v.tree.key})}
                                              onClick={this.chooseEventBtn.bind(this, v.tree.key, v.tree)}
                                              ref={'EBTitle'+i}
                                              key={i}>
                                              <div className={$class("name-wrap", {'name-wrap-border':i!==0})}>
                                                  <span className="name">{name}</span>
                                              </div>
                                        </div>);
                            })
                        }
                    </div>
                    <div className="EB--title-search-wrap f--hlc">
                        <div className="search-group f--hlc">
                            <button className="search-btn" onClick={this.onClickShowNoEventObjList} title='添加对象事件'>
                                <div className='btn-icon'>
                                    <span className='heng'/><span  className='shu'/>
                                </div>
                            </button>
                            <Input className="search-input"
                                   placeholder="搜索对象"
                                   onClick={this.onSearchPhraseChange}
                                   onChange={this.onSearchPhraseChange}
                                   size="small"/>
                        </div>
                        {
                            this.state.objListType === objListType.default
                                ? null
                                : (<div className="object-list-wrap">
                                <div className="icon"></div>
                                <div className="title">
                                    {
                                        this.state.objListType === objListType.noEvent
                                            ? '可添加事件的对象'
                                            : '搜索结果'
                                    }
                                </div>
                                <div className="object-list">
                                    {
                                        this.state.objList&&this.state.objList.length>0
                                            ? this.state.objList.map((v,i)=>{
                                                let picProps = this.getObjIcon(v);
                                                return <div className="item f--hlc" key={i}
                                                            onClick={this.onClickObj.bind(this, v.key, v)}>
                                                    {
                                                        picProps.picIsImage
                                                            ?<span className="item-icon2">
                                                                <img className="item-img" src={ picProps.pic } />
                                                            </span>
                                                            : <span className={$class('item-icon', picProps.pic)} />
                                                    }
                                                        <div className="text">{v.props.block?v.props.block.name:v.props.name}</div>
                                                    </div>
                                            })
                                            : (<div className="no-item">暂无相关对象</div>)
                                    }
                                </div>
                            </div>)
                        }
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
                                                  eventList={v.props.block?v.props.block.eventTree:v.props.eventTree}
                                                  name={v.props.block?v.props.block.name:v.props.name}
                                                  wKey={v.key}
                                                  dbList={this.state.dbList}
                                                  activeKey={this.state.activeKey}
                                                  chooseEventBtn={this.chooseEventBtn.bind(this, v.key, v)} />
                                  })
                        }
                    </div>
                </div>

                <div className='hidden'>
                    <ComponentPanel ref='ComponentPanel' />
                </div>
            </div>
        );
    }
}

module.exports = EventBox;
