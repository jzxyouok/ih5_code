//对象树
import React from 'react';
import $class from 'classnames';
import $ from 'jquery';

import ComponentPanel from '../ComponentPanel';
import WidgetActions from '../../actions/WidgetActions';
import WidgetStore, {nodeType, keepType, varType, dataType, isCustomizeWidget} from '../../stores/WidgetStore';

const drapTipId = 'treeDragTip';
const placeholderId = 'treeDragPlaceholder';
const appId = 'iH5-App';
const overPosition = {
    top: 1,
    mid: 2,
    bot: 3,
};

class ObjectTree extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            nid : null,
            openData : [],
            widgetTree: null,
            selectedNode: [],
            expandedNodes: [],
            changed : null,
            isLoadTree : true,
            selectedLayer : -1,
            selectWidget : null,
            activeEventTreeKey: null, //组件对应事件按钮被激活
            editMode:false   //处于更改名字状态
            //widgetTreeChildren :null
            , allTreeData : [],
            nodeType: nodeType.widget
        };
        this.chooseMoreStatus=false;

        this.chooseBtn = this.chooseBtn.bind(this);
        this.openBtn = this.openBtn.bind(this);
        this.closeBtn = this.closeBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.addOpenId = this.addOpenId.bind(this);
        this.showHideBtn = this.showHideBtn.bind(this);
        this.lockBtn = this.lockBtn.bind(this);
        this.eventBtn = this.eventBtn.bind(this);

        //对象的复制/剪切/黏贴
        this.itemAddKeyListener = this.itemAddKeyListener.bind(this);
        this.itemRemoveKeyListener = this.itemRemoveKeyListener.bind(this);
        this.itemKeyAction = this.itemKeyAction.bind(this);
        this.itemPaste = this.itemPaste.bind(this);

        //伪对象相关
        this.fadeWidgetBtn = this.fadeWidgetBtn.bind(this);

        this.startEditObjName = this.startEditObjName.bind(this);
        this.endEditObjName = this.endEditObjName.bind(this);
        this.editStopPropagation = this.editStopPropagation.bind(this);
        this.onRename = this.onRename.bind(this);

        //拖动对象的方法
        this.itemDragStart = this.itemDragStart.bind(this);
        this.itemDragEnd = this.itemDragEnd.bind(this);
        this.itemDragOver = this.itemDragOver.bind(this);
        this.getDeltaY = this.getDeltaY.bind(this);
        //拖动时显示的tip
        this.dragWithTip = this.dragWithTip.bind(this);
        this.initialDragTip = this.initialDragTip.bind(this);
        this.destroyDragTip = this.destroyDragTip.bind(this);

        this.dragged = null;
        this.over = null;
        this.overPosition = null;
        //有关拖动的相关参数
        this.placeholder = document.createElement('div');
        this.placeholder.id = 'treeDragPlaceholder';
        this.dragTip = document.createElement('div');
        this.dragTip.id = drapTipId;

        //多选
        this.onKeyDown =this.onKeyDown.bind(this);
        this.onKeyUp =this.onKeyUp.bind(this);
        this.chooseMore=this.chooseMore.bind(this);

    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());

        //多选
        document.body.addEventListener('keydown', this.onKeyDown);
        document.body.addEventListener('keyup', this.onKeyUp);
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        //console.log(widget);
        //initTree : 初始化对象树
        if (widget.initTree !== undefined){
            this.setState({
                widgetTree: widget.initTree[0] ,
                allTreeData : widget.initTree
            });
            this.addOpenId();
        }

        //redrawTree : 重新加载对象树
        else if (widget.redrawTree !== undefined){
            this.forceUpdate();
            this.addOpenId();
        }

        else if(widget.skipProperty){
            this.forceUpdate();
        }

        else if(widget.selectWidget || widget.selectFunction || widget.selectVariable || widget.selectDBItem){
            //触发失焦
            if(this.state.nid&&document.getElementById('tree-item-'+this.state.nid)){
                document.getElementById('tree-item-'+this.state.nid).blur();
            }

            if(widget.selectWidget){
                this.setState({
                    selectWidget : widget.selectWidget
                    , nid : widget.selectWidget.key,
                    nodeType: nodeType.widget
                });
                this.addOpenId();
            } else if (widget.selectFunction) {
                this.setState({
                    selectWidget: null,
                    nid: widget.selectFunction.key,
                    nodeType: nodeType.func
                });
            } else if (widget.selectVariable) {
                this.setState({
                    selectWidget: null,
                    nid: widget.selectVariable.key,
                    nodeType: nodeType.var
                });
            } else if (widget.selectDBItem) {
                this.setState({
                    selectWidget: null,
                    nid: widget.selectDBItem.key,
                    nodeType: nodeType.dbItem
                });
            }

            //触发聚焦
            if(document.getElementById('tree-item-'+this.state.nid)){
                document.getElementById('tree-item-'+this.state.nid).focus();
            }
        } else if(widget.activeEventTreeKey) {
            //激活对象key对应对象的事件树
            this.setState({
                activeEventTreeKey: widget.activeEventTreeKey.key
            })
        }

        //selectWidget : 选择工具创建相应图层
        if (widget.selectWidget !== undefined) {
            let changed;
            if (widget.selectWidget) {
                let key = '' + widget.selectWidget.key;
                changed = {selectedNode: [key], expandedNodes:this.state.expandedNodes};
                let node = widget.selectWidget;
                while (node) {
                    key = '' + node.key;
                    if (changed.expandedNodes.indexOf(key) < 0)
                        changed.expandedNodes.push(key);
                    node = node.parent;
                }
            } else {
                changed = {selectedNode: []};
            }
            this.setState({
                changed : changed
            });
        }
    }

    addOpenId(){
        let data = this.state.widgetTree;
        //let data2 = null;
        let fuc = (nid)=>{
            let array = this.state.openData;
            let index = array.indexOf(nid);
            if( index < 0){
                array.push(nid);
                this.setState({
                    openData : array
                });
            }
        };
        if(data){
            fuc(data.tree.key);
            //data2 = data.tree.children.concat();
            //if(data2){
            //    data2.reverse();
            //    this.setState({
            //        widgetTreeChildren : data2
            //    });
            //}
        }
        if(this.state.selectWidget){
            let nid = this.state.selectWidget.key;
            let array = this.state.openData;
            let index = array.indexOf(nid);
            let index2 = array.indexOf(this.state.selectedLayer);
            let index3 = this.state.selectWidget.parent ? array.indexOf(this.state.selectWidget.parent.key) : -1;

            let fun = (v)=>{
                if(v.parent){
                    let ccc = array.indexOf(v.parent.key);
                    let xxx = v.parent.key;
                    if (ccc< 0 && xxx !==1){
                        array.push(xxx);
                    }
                    if(v.parent.parent){
                        fun(v.parent);
                    }
                }
            };
            //console.log(this.state.selectedLayer !== nid);
            if(this.state.selectedLayer !== nid){
                if( index < 0){
                    array.push(nid);
                    if( index2 >= 0 && index3 < 0 && this.state.selectedLayer !== 1){
                        array.splice(index2, 1);
                    }
                }
                if(index3 < 0){
                    fun(this.state.selectWidget)
                }
            }
            else {
                if( index < 0){
                    array.push(nid);
                }
                if(index3 < 0){
                    fun(this.state.selectWidget)
                }
            }
            //console.log(array);
            this.setState({
                openData : array,
                selectedLayer : nid
            });
        }
    }

    chooseBtn(nid, data, event){
        if(event){
            event.stopPropagation();
        }
        if(this.chooseMoreStatus){
            //ctrl键按下
        }else{
            this.setState({
                nid : nid,
                editMode: false
            },()=>{
                WidgetActions['selectWidget'](data, true);
            });
        }
    }

    openBtn(event){
        event.stopPropagation();
        let id = parseInt(event.currentTarget.getAttribute('data-nid'));
        let data = this.state.openData;
        let index = data.indexOf(id);
        if( index < 0){
            data.push(id);
            this.setState({
                openData : data
            });
        }
        //console.log(data);
    }

    closeBtn(event){
        event.stopPropagation();
        let id = parseInt(event.currentTarget.getAttribute('data-nid'));
        let data = this.state.openData;
        let index = data.indexOf(id);
        if( index >= 0){
            data.splice(index, 1);
            this.setState({
                openData : data
            });
        }
        //console.log(data);
    }

    showHideBtn(data,bool){
        //console.log(data);
        data.props['visible'] = bool;
        data.node['visible'] = bool;
        WidgetActions['render']();
    }

    lockBtn(key, data) {
        if(key === this.state.nid){
            WidgetActions['lockWidget']();
            WidgetActions['render']();
        }
    }

    eventBtn(nid, data) {
        //分情况处理
        if(this.state.nid != nid) {
            this.setState({
                nid : nid,
                editMode: false
            },()=>{
                WidgetActions['selectWidget'](data, true, keepType.event);
                WidgetActions['activeEventTree'](nid);
            });
        } else  {
            if(this.state.activeEventTreeKey!=null) {
                WidgetActions['enableEventTree']();
            } else {
                WidgetActions['activeEventTree'](nid);
            }
        }
    }

    fadeWidgetBtn(nid, data, type) {
        switch (type){
            case nodeType.func:
                this.setState({
                    nid : nid,
                    editMode: false
                },()=>{
                    WidgetActions['selectWidget'](data.widget, false, keepType.func);
                    WidgetActions['selectFunction'](data);
                });
                break;
            case nodeType.var:
                this.setState({
                    nid : nid,
                    editMode: false
                },()=>{
                    WidgetActions['selectWidget'](data.widget, false, keepType.var);
                    WidgetActions['selectVariable'](data);
                });
                break;
            case nodeType.dbItem:
                this.setState({
                    nid : nid,
                    editMode: false
                },()=>{
                    WidgetActions['selectWidget'](data.widget, false, keepType.dbItem);
                    WidgetActions['selectDBItem'](data);
                });
                break;
        }
    }

    startEditObjName(id, data, event) {
        event.stopPropagation();
        var editItem = document.getElementById('item-name-input-'+ id);
        editItem.value = data.props.name;
        this.setState({
            editMode: true
        }, ()=>{
            let temp = () =>{
                editItem.focus();
                editItem.select();
            };
            setTimeout(()=> {
                temp();
            }, 100);

        });
    }

    endEditObjName(event) {
        event.stopPropagation();
        this.onRename(event);
    }

    onRename(event){
        this.setState({
            editMode: false
        });
        if(event.target.value) {
            WidgetActions['renameTreeNode'](this.state.nodeType, event.target.value, true);
        }
    }

    editStopPropagation(event) {
        event.stopPropagation();
    }

    itemAddKeyListener(event){
        this.itemRemoveKeyListener(event);
        if (event.currentTarget.className == 'stage'){
            event.currentTarget.addEventListener('keyup', this.itemPaste);
        } else {
            event.currentTarget.addEventListener('keyup', this.itemKeyAction);
        }
    }

    itemRemoveKeyListener(event){
        if (event.currentTarget.className == 'stage'){
            event.currentTarget.removeEventListener('keyup', this.itemPaste);
        } else {
            event.currentTarget.removeEventListener('keyup', this.itemKeyAction);
        }
    }

    itemPaste(event){
        event.preventDefault();
        event.stopPropagation();
        let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        let didPressCtrl = (isMac && window.macKeys.cmdKey) || (!isMac && event.ctrlKey);
        //黏贴
        if (didPressCtrl && event.keyCode == 86) {
            WidgetActions['pasteTreeNode']();
        }
    }

    itemKeyAction(event){
        event.preventDefault();
        event.stopPropagation();
        //如果是edit模式，不做任何事情
        if(this.state.editMode){
            if(event.keyCode == 13) {
                this.onRename(event);
            }
            return;
        }

        let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        let didPressCtrl = (isMac && window.macKeys.cmdKey) || (!isMac && event.ctrlKey);
        //复制 67
        if (didPressCtrl && event.keyCode == 67) {
            WidgetActions['copyTreeNode'](this.state.nodeType);
            window.macKeys.reset();
        }
        //黏贴 86
        if (didPressCtrl && event.keyCode == 86) {
            //当前选中func or var就不理会
            if(this.state.nodeType === nodeType.func ||
                this.state.nodeType==nodeType.var ||
                this.state.nodeType == nodeType.dbItem) {
                window.macKeys.reset();
                return;
            }
            WidgetActions['pasteTreeNode']();
            window.macKeys.reset();
        }
        //剪切 88
        if (didPressCtrl && event.keyCode == 88) {
            WidgetActions['cutTreeNode'](this.state.nodeType);
            window.macKeys.reset();
        }
        //删除 delete
        if (!didPressCtrl && event.keyCode == 8) {
            WidgetActions['deleteTreeNode'](this.state.nodeType);
            window.macKeys.reset();
        }
    }

    dragWithTip(x, y, isShow) {
        this.dragTip.style.top = y+15+'px';
        this.dragTip.style.left = x+10+'px';
        isShow?this.dragTip.style.display='block':this.dragTip.style.display='none';
    }

    initialDragTip(content, isShow){
        this.dragTip.innerHTML = content;
        document.getElementById(appId).appendChild(this.dragTip);
        isShow?this.dragTip.style.display='block':this.dragTip.style.display='none';
    }

    destroyDragTip(){
        this.dragTip.innerHTML = '';
        this.dragTip.style.display = 'none';
        var elem = document.getElementById(drapTipId);
        if(elem){
            elem.parentElement.removeChild(elem);
        }
    }

    itemDragStart(nid, data, e){
        //如果是edit模式，不做任何事情
        if(this.state.editMode){
            e.preventDefault();
            return;
        }
        e.stopPropagation();
        this.initialDragTip('拖拽对象到此', false);
        //拖动同时把item设为被选中
        this.chooseBtn(nid, data);
        this.dragged = e.currentTarget;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.dragged);
    }

    itemDragEnd(e){
        //如果是edit模式，不做任何事情
        if(this.state.editMode){
            e.preventDefault();
            return;
        }
        e.stopPropagation();
        this.destroyDragTip();
        // 删除placeholder
        var elem = document.getElementById(placeholderId);
        if(elem) {
            elem.parentElement.removeChild(elem);
        }
        if(this.dragged&&this.over){
            this.over.style.backgroundColor = '';
            //位置
            let srcOrder = Number(this.dragged.dataset.order);
            let destOrder = Number(this.over.dataset.order);
            //对象的key
            let srcKey = Number(this.dragged.dataset.wkey);
            let destKey = Number(this.over.dataset.wkey);
            //对象的父key
            let srcParentKey = Number(this.dragged.dataset.parentkey);
            let destParentKey = Number(this.over.dataset.parentkey);
            //还需判断是否是目标对象是否是来源对象的子对象，如果是就不允许
            if((srcKey == destKey && srcParentKey === destParentKey)) {
                //相同位置
                return;
            } else if (srcParentKey === destKey) {
                //目标为来源的父节点
                switch (this.overPosition){
                    case overPosition.top:
                        WidgetActions['moveWidget'](srcKey, destParentKey, destOrder);
                        break;
                    case overPosition.bot:
                        WidgetActions['moveWidget'](srcKey, destParentKey, ++destOrder);
                        break;
                    default:
                        break;
                }
            } else if (srcKey !== destKey && srcParentKey === destParentKey){
                //同层同源
                switch (this.overPosition){
                    case overPosition.mid:
                        //放入同层元素即跨层
                        WidgetActions['moveWidget'](srcKey, destKey, 0);
                        break;
                    case overPosition.bot:
                        destOrder++;
                        if(srcOrder == destOrder) {
                            //来源在目标元素下面
                            return;
                        } else {
                            WidgetActions['reorderWidget'](srcOrder-destOrder>0?-(srcOrder-destOrder):-(srcOrder-(--destOrder)));
                        }
                        break;
                    default:
                        WidgetActions['reorderWidget'](srcOrder-destOrder>0?-(srcOrder-destOrder):-(srcOrder-(--destOrder)));
                        break;
                }
            } else {
                //跨层
                switch (this.overPosition){
                    case overPosition.mid:
                        //放入跨层元素内部
                        WidgetActions['moveWidget'](srcKey, destKey, 0);
                        break;
                    default:
                        WidgetActions['moveWidget'](srcKey, destParentKey, destOrder);
                        break;
                }
            }
        }
    }

    itemDragOver(e){
        //如果是edit模式，不做任何事情
        if(this.state.editMode){
            e.preventDefault();
            return;
        }
        e.stopPropagation();
        this.dragWithTip(e.clientX, e.clientY, true);
        if(e.target.id === placeholderId) {
            this.placeholder.style.display = 'hidden';
            return;
        }
        //递归找到并获取名字叫item的div
        let findItemDiv = (target,cName) => {
            if(target) {
                if(target.className === cName) {
                    return target;
                } else {
                    return findItemDiv(target.parentNode, cName);
                }
            } else {
                return null;
            }
        };
        if(this.over){
            this.over.style.backgroundColor = '';
        }
        if(this.placeholder){
            this.placeholder.style.display = 'block';
            this.placeholder.style.marginLeft = '';
        }
        this.over = findItemDiv(e.target, 'item-title-wrap clearfix');
        if(this.over) {
            if (this.over.dataset.wkey == this.dragged.dataset.wkey) {
                if(this.placeholder&&this.placeholder.parentElement) {
                    this.placeholder.parentElement.removeChild(this.placeholder);
                }
            } else {
                let deltaTop = e.clientY-this.getDeltaY(this.over)+document.body.scrollTop;
                let maxHeight = this.over.offsetHeight;
                let layer = this.over.dataset.layer;
                let mid1 = maxHeight/3;
                let mid2 = maxHeight*2/3;
                if(deltaTop>=0&&deltaTop<=mid1){
                    this.overPosition=overPosition.top;
                    this.over.style.backgroundColor = '';
                    let destlayerPadding =  layer==='1' ? '' :layer *20 + 22 +'px';
                    this.placeholder.style.marginLeft = destlayerPadding;
                    this.over.parentNode.insertBefore(this.placeholder, this.over);
                } else if (deltaTop>mid1&&deltaTop<mid2) {
                    this.overPosition=overPosition.mid;
                    this.over.style.backgroundColor = '#FFA800';
                    if(this.placeholder&&this.placeholder.parentElement) {
                        this.placeholder.parentElement.removeChild(this.placeholder);
                    }
                } else if (deltaTop>=mid2&&deltaTop<=maxHeight) {
                    this.overPosition=overPosition.bot;
                    this.over.style.backgroundColor = '';
                    let destlayerPadding = layer==='1' ? '' :layer *20 + 22 +'px';
                    this.placeholder.style.marginLeft = destlayerPadding;
                    this.over.parentNode.appendChild(this.placeholder);
                }
            }
        }
    }

    getDeltaY(obj){
        var ParentObj=obj;
        var top=obj.offsetTop;
        while(ParentObj=ParentObj.offsetParent){
            top+=ParentObj.offsetTop;
        }
        return top;
    }

    onKeyDown(e){
        let  evt = e ? e : window.event;
        if (!this.chooseMoreStatus && evt.ctrlKey) {
            this.chooseMoreStatus=true;
        }
    }
    onKeyUp(e){
        let  evt = e ? e : window.event;
        if(evt.keyCode==17){
            this.chooseMoreStatus=false;
            console.log('haha');
        }
    }
    chooseMore(e){
        if(this.chooseMoreStatus){
            let $oItem =$(e.currentTarget);

            let $oItemTitle =  $oItem.find('.item-title:eq(0)');
            let $oItemEventEmpty =  $oItem.find('.item-event-empty:eq(0)');


        }
    }

    render() {
        //console.log(this.state.widgetTree);
        //let objectData = this.state.widgetTree;
        let allTreeData = this.state.allTreeData;
        let num = 0;

        let btn = (show,data)=>{
            //0图层及图层内的所有内容不可看，1可在舞台看见，-1指的是整个舞台，必是可见的, -2是没有可见隐藏这个属性
            if(show === 0 ){
                return <div className="btn f--hcc hide-btn"
                            onClick={ this.showHideBtn.bind(this,data,true) }><span /></div>;
            }
            else if(show === -1){
                return <div className="btn f--hcc show-btn"><span /></div>;
            }
            else if(show === -2){
                return <div className="btn f--hcc none-btn"><span/></div>;
            }
            else{
                return <div className="btn f--hcc show-btn"
                            onClick={ this.showHideBtn.bind(this,data,false) }><span /></div>;
            }
        };

        let enableEventTreeBtn = (nid,data)=> {
            //0为没有事件, 1为有事件正常状态
            let btn = <div className={$class('event-icon',
                    {'event-icon-normal':data.props['enableEventTree']},
                    {'event-icon-disable':!data.props['enableEventTree']},
                    {'active':this.state.activeEventTreeKey==nid})}
                           onClick={this.eventBtn.bind(this,nid,data)}></div>;
            return btn;
        };

        let fadeWidgetList = (data, num, type)=> {
            let content = data.map((item, i)=> {
                return <div className={"fade-widget-title-wrap clearfix"} key={i}
                            id={'tree-item-'+ item.key}
                            tabIndex={item.key}
                            onFocus={this.itemAddKeyListener.bind(this)}
                            onBlur={this.itemRemoveKeyListener.bind(this)}>
                    <div className={$class('fade-widget-title f--h f--hlc',
                        {'active': item.key === this.state.nid})}
                         onClick={this.fadeWidgetBtn.bind(this, item.key, item, type)}
                         style={{ paddingLeft: num === 0 ? '28px' :num *20 + 22 +'px', width : this.props.width - 36 - 24  }}>
                        <span className={$class('item-icon fade-widget-icon',
                            {'func-icon':type===nodeType.func},
                            {'var-num-icon': item.type===varType.number&&type===nodeType.var},
                            {'var-str-icon': item.type===varType.string&&type===nodeType.var},
                            {'db-item-icon': type===nodeType.dbItem})}/>
                        <div className='fade-widget-name-wrap' onDoubleClick={this.startEditObjName.bind(this, item.key, item)}>
                            <p className={$class({'hidden':((item.key === this.state.nid)&&this.state.editMode)})} >{item.props.name}</p>
                            <input id={'item-name-input-'+item.key} type="text"
                                   onBlur={this.endEditObjName}
                                   onClick={this.editStopPropagation}
                                   className={$class('item-name-input',{'hidden':!((item.key === this.state.nid)&&this.state.editMode)})}/>
                        </div>
                    </div>
                    <div className={$class('item-event')}>
                        <div className={$class('item-event-empty',{'active': item.key === this.state.nid})}
                             onClick={this.fadeWidgetBtn.bind(this, item.key, item, type)}></div>
                    </div>
                </div>
            });
            return content
        };

        let icon = (open, nid)=>{
            // 0是该图层下不包含任何内容，1有内容，但是内容收起来， 2有内容，且展开内容
            if(open === 0){
                return <span className="icon not-icon" />;
            }
            else if(open === 1){
                if( this.state.openData.indexOf(nid) >= 0){
                    return <span className="icon open-icon" onClick={this.closeBtn.bind(this)} data-nid={nid} />;
                }
                else {
                    return <span className="icon close-icon" onClick={this.openBtn.bind(this)} data-nid={nid} />;
                }
            }
        };

        let stageContent = (data)=>{
            num++;
            let content = data.map(fuc);
            num--;
            return content;
        };

        let fuc = (v,i)=>{
            let pic = null;
            let picIsImage = true;
            this.refs.ComponentPanel.panels[0].cplist.forEach((v1,i2)=>{
                if(isCustomizeWidget(v.className)) {
                    pic = 'component-icon';
                    picIsImage = false;
                }
                else if(v.className == 'db'){
                    if(v.node.dbType == "shareDb"){
                        pic = 'shareDb-icon';
                    }
                    else {
                        pic = 'personalDb-icon';
                    }
                    picIsImage = false;
                } else if(v.className === 'data'){
                    if(v.props.type === dataType.twoDArr) {
                        pic = 'twoDArr-icon';
                    } else if (v.props.type === dataType.oneDArr) {
                        pic = 'oneDArr-icon';
                    }
                    picIsImage = false;
                }
                else if (v1.className === v.className){
                    if(v.className === 'image' || v.className === 'imagelist') {
                        if(v.props.link !== undefined &&v.rootWidget.imageList&&v.rootWidget.imageList.length>v.props.link){
                            pic = v.rootWidget.imageList[v.props.link];
                        } else {
                            pic = v1.icon;
                        }
                    } else {
                        pic = v1.icon;
                    }
                }
            });
            return  <div className='item'
                         key={i}
                         onClick={this.chooseMore}>
                <div className='item-title-wrap clearfix'
                     id={'tree-item-'+ v.key}
                     tabIndex={v.key}
                     data-order={i}
                     data-layer={num}
                     data-wKey={v.key}
                     data-parentKey={v.parent.key}
                     draggable='true'
                     onDragStart={this.itemDragStart.bind(this,v.key, v)}
                     onDragEnd={this.itemDragEnd}
                     onFocus={this.itemAddKeyListener.bind(this)}
                     onBlur={this.itemRemoveKeyListener.bind(this)}>
                    <div className={$class('item-title f--h f--hlc',{'active': v.key === this.state.nid})}
                         onClick={this.chooseBtn.bind(this,v.key, v)}
                         style={{ paddingLeft: num === 0 ? '28px' :num *20 + 22 +'px', width : this.props.width - 36 - 24  }}>

                        {
                            v.className =='track' || v.className=='effect'
                            || v.className=='easing'||v.className=='world'
                            ||v.className=='body'||v.className=='audio'
                                ? btn(-2, v)
                                : v.props.visible === false
                                ? btn(0, v)
                                : btn(1, v)
                        }

                        {
                            v.children.length > 0
                            ||v.funcList.length > 0
                            ||v.intVarList.length > 0
                            ||v.strVarList.length > 0
                            ||v.dbItemList&&v.dbItemList.length>0
                                ? icon( 1 , v.key)
                                : icon( 0 , v.key)
                        }
                        {
                            picIsImage?<span className="item-icon"><img className="item-img" src={ pic } /></span>
                                : <span className={$class('item-icon', pic)} />
                        }
                        {
                            isCustomizeWidget(v.className)||v.className == 'db'
                                ? <div className='item-name-wrap'>
                                    <p>{v.props.name}</p>
                                  </div>
                                : <div className='item-name-wrap'
                                       onDoubleClick={this.startEditObjName.bind(this, v.key, v)}>
                                    <p className={$class({'hidden':((v.key === this.state.nid)&&this.state.editMode)})} >{v.props.name}</p>
                                    <input id={'item-name-input-'+v.key} type="text"
                                           onBlur={this.endEditObjName}
                                           onClick={this.editStopPropagation}
                                           className={$class('item-name-input',{'hidden':!((v.key === this.state.nid)&&this.state.editMode)})}/>
                                  </div>
                        }
                        {
                            v.props.locked!==undefined && v.props.locked
                                ? <span className='lock-icon' onClick={ this.lockBtn.bind(this, v.key, v) }/>
                                : null
                        }
                    </div>
                    <div className={$class('item-event')}>
                        {
                            v.props.eventTree
                                ? enableEventTreeBtn(v.key, v)
                                : <div className={$class('item-event-empty',{'active': v.key === this.state.nid})}
                                       onClick={this.chooseBtn.bind(this,v.key, v)}></div>
                        }
                    </div>
                </div>
                {
                    v.className === 'db'
                        ?  <div className={$class('clearfix', {'hidden': this.state.openData.indexOf(v.key) < 0 })}>
                            {
                                v.dbItemList.length === 0
                                ? null
                                : fadeWidgetList(v.dbItemList, num+1, nodeType.dbItem)
                            }
                        </div>
                        : null
                }
                <div className={$class('clearfix', {'hidden': this.state.openData.indexOf(v.key) < 0 })}>
                    {v.intVarList.length === 0
                        ? null
                        : fadeWidgetList(v.intVarList, num+1, nodeType.var)
                    }
                </div>
                <div className={$class('clearfix', {'hidden': this.state.openData.indexOf(v.key) < 0 })}>
                    {v.strVarList.length === 0
                        ? null
                        : fadeWidgetList(v.strVarList, num+1, nodeType.var)
                    }
                </div>
                <div className={$class('clearfix', {'hidden': this.state.openData.indexOf(v.key) < 0 })}>
                    {v.funcList.length === 0
                        ? null
                        : fadeWidgetList(v.funcList, num+1, nodeType.func)
                    }
                </div>
                <div className={$class({'hidden': this.state.openData.indexOf(v.key) < 0 }) }>
                    {
                        v.children.length === 0
                            ? null
                            : stageContent(v.children)
                    }
                </div>
            </div>;
        };

        return (
            <div className='ObjectTree'>
                <div className="stage">
                {
                     !allTreeData
                        ? null
                        : allTreeData.map((v,i)=>{
                             return  <div className='stage-item' key={i}>
                                 <div className='stage-title-wrap clearfix'>
                                     <div className={$class('stage-title f--h f--hlc',{'active': v.tree.key === this.state.nid})}
                                          style={{ width : this.props.width - 36 - 24 }}
                                          onClick={this.chooseBtn.bind(this, v.tree.key, v.tree)}
                                          onFocus={this.itemAddKeyListener.bind(this)}
                                          onBlur={this.itemRemoveKeyListener.bind(this)}
                                          tabIndex={v.tree.key}
                                          id={'tree-item-'+ v.tree.key}>
                                         { btn(-1, v.tree) }
                                         {
                                             v.tree.children.length > 0
                                             ||v.tree.funcList.length > 0
                                             ||v.tree.intVarList.length > 0
                                             ||v.tree.strVarList.length > 0
                                                 ? icon( 1 , v.tree.key)
                                                 : icon( 0 , v.tree.key)
                                         }
                                         <span className={$class('stage-icon',{"module-icon": i !== 0})} />
                                         {
                                             v.name == 'stage'
                                                 ?<div className='stage-name-wrap' onDoubleClick={this.startEditObjName.bind(this, v.tree.key, v.tree)}>
                                                    <p className={$class({'hidden':((v.tree.key === this.state.nid)&&this.state.editMode)})} >
                                                     {v.tree.props.name}
                                                    </p>
                                                    <input id={'item-name-input-'+v.tree.key} type="text"
                                                        onBlur={this.endEditObjName}
                                                        onClick={this.editStopPropagation}
                                                        className={$class('item-name-input',{'hidden':!((v.tree.key === this.state.nid)&&this.state.editMode)})}/>
                                                   </div>
                                                 : <div className='stage-name-wrap'><p>{ v.name }</p></div>
                                         }
                                     </div>
                                     <div className={$class('item-event')}>
                                         {
                                             v.tree.props.eventTree
                                                 ? enableEventTreeBtn(v.tree.key, v.tree)
                                                 : <div className={$class('item-event-empty',{'active': v.tree.key === this.state.nid})}
                                                        onClick={this.chooseBtn.bind(this, v.tree.key, v.tree)}></div>
                                         }
                                     </div>
                                 </div>
                                 <div className={$class('clearfix', {'hidden':  this.state.openData.indexOf(v.tree.key) < 0 })}>
                                     {v.tree.intVarList.length === 0
                                         ? null
                                         : fadeWidgetList(v.tree.intVarList, 1, nodeType.var)
                                     }
                                 </div>
                                 <div className={$class('clearfix', {'hidden':  this.state.openData.indexOf(v.tree.key) < 0 })}>
                                     {v.tree.strVarList.length === 0
                                         ? null
                                         : fadeWidgetList(v.tree.strVarList, 1, nodeType.var)
                                     }
                                 </div>
                                 <div className={$class('clearfix', {'hidden':  this.state.openData.indexOf(v.tree.key) < 0 })}>
                                     {v.tree.funcList.length === 0
                                         ? null
                                         : fadeWidgetList(v.tree.funcList, 1, nodeType.func)
                                     }
                                 </div>
                                 <div className={$class('stage-content clearfix', {'hidden':  this.state.openData.indexOf(v.tree.key) < 0 })}
                                      onDragOver={this.itemDragOver}>
                                     {
                                         v.tree.children.length === 0
                                             ? null
                                             : stageContent(v.tree.children)
                                         //this.state.widgetTreeChildren
                                         //    ?  this.state.widgetTreeChildren.length === 0
                                         //            ? null
                                         //            : stageContent(this.state.widgetTreeChildren)//    : null
                                     }
                                 </div>
                             </div>
                          })
                }
                </div>

                <div className='hidden'>
                    <ComponentPanel ref='ComponentPanel' />
                </div>
            </div>
        );
    }
}

module.exports = ObjectTree;