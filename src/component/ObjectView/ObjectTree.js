//对象树
import React from 'react';
import $class from 'classnames';
import $ from 'jquery';

import ComponentPanel from '../ComponentPanel';
import WidgetActions from '../../actions/WidgetActions';
import WidgetStore, {nodeType, keepType, varType, dataType, isCustomizeWidget, selectableClass} from '../../stores/WidgetStore';
import {checkChildClass} from '../PropertyMap';
import {chooseFile} from  '../../utils/upload';

import SelectTargetStore from '../../stores/SelectTargetStore'

import ReDbOrSockIdAction from "../../actions/ReDbOrSockIdAction";

import {imgServer} from '../../api/BaseApi';

const drapTipId = 'treeDragTip';
const placeholderId = 'treeDragPlaceholder';
const appId = 'iH5-App';
const overPosition = {
    top: 1,
    mid: 2,
    bot: 3,
};
const tipAllow = '<span style="background-position:-40px -200px;"></span><div style="background-color:#008700;">拖至此处</div>';
const tipForbidden = '<span style="background-position:-40px -240px;"></span><div style="background-color:#b50000;">不可拖入</div>';
const allowColor = '#FFA800';
const forbiddenColor = '#8F8F8F';

const imgServerPrefix = imgServer;

const originToolMenuList = [
    [{name:'copy',showName:'复制'},{name:'cut',showName:'剪切'},{name:'paste',showName:'粘贴'},
        {name:'relPaste',showName:'相对位置粘贴'},{name:'delete',showName:'删除'}],
    [{name:'originSize',showName:'原始大小'},{name:'originPercent',showName:'原始比例'}],
    [{name:'crossCopy',showName:'跨案例复制'},{name:'crossPaste',showName:'跨案例粘贴'}],
    [{name:'saveAsBlock',showName:'生成小模块'}]
];

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
            nodeType: nodeType.widget,

            targetList: [], //目标选择列表
            selectTargetMode: false, //目标选择模式

            multiSelectMode: false,
            nids: [],   //多选的

            showToolMenu: false, //右键
            toolMenuList: JSON.parse(JSON.stringify(originToolMenuList)), //menuList

            activeBlockMode: false,  //小模块激活模式
        };

        this.chooseBtn = this.chooseBtn.bind(this);
        this.openBtn = this.openBtn.bind(this);
        this.closeBtn = this.closeBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.addOpenId = this.addOpenId.bind(this);
        this.showHideBtn = this.showHideBtn.bind(this);
        this.lockBtn = this.lockBtn.bind(this);
        this.eventBtn = this.eventBtn.bind(this);
        this.onChangeReSrc = this.onChangeReSrc.bind(this);
        this.onFileUpload = this.onFileUpload.bind(this);

        this.onSelectTargetMode = this.onSelectTargetMode.bind(this);
        this.onSelectTargetModeChange = this.onSelectTargetModeChange.bind(this);
        this.checkAllSelectTarget = this.checkAllSelectTarget.bind(this);

        //对象的复制/剪切/黏贴
        this.itemAddKeyListener = this.itemAddKeyListener.bind(this);
        this.itemRemoveKeyListener = this.itemRemoveKeyListener.bind(this);
        this.itemKeyAction = this.itemKeyAction.bind(this);
        this.rootKeyAction = this.rootKeyAction.bind(this);
        this.itemActions = this.itemActions.bind(this);
        this.itemWindowKeyAction = this.itemWindowKeyAction.bind(this);

        this.didPressMacCmdKey = false;
        this.checkPressCmdKey = this.checkPressCmdKey.bind(this);
        this.resetCmdKey = this.resetCmdKey.bind(this);

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
        this.getDeltaX = this.getDeltaX.bind(this);
        this.getDeltaY = this.getDeltaY.bind(this);
        this.getChildrenKeys = this.getChildrenKeys.bind(this);
        //拖动时显示的tip
        this.dragWithTip = this.dragWithTip.bind(this);
        this.initialDragTip = this.initialDragTip.bind(this);
        this.destroyDragTip = this.destroyDragTip.bind(this);

        this.dragged = null;
        this.selectDragData = null;
        this.over = null;
        this.overPosition = null;
        //有关拖动的相关参数
        this.placeholder = document.createElement('div');
        this.placeholder.id = 'treeDragPlaceholder';
        this.dragTip = document.createElement('div');
        this.dragTip.id = drapTipId;

        //多选
        this.onMultiSelectKeyDown =this.onMultiSelectKeyDown.bind(this);
        this.onMultiSelectKeyUp =this.onMultiSelectKeyUp.bind(this);
        this.isInMultiList = this.isInMultiList.bind(this);
        this.onLeaveMultiSelectMode = this.onLeaveMultiSelectMode.bind(this);

        this.addModuleBtn = this.addModuleBtn.bind(this);

        //右键点击

        this.relocateToolMenu = this.relocateToolMenu.bind(this);
        this.onRightClick = this.onRightClick.bind(this);
        this.onHideToolMenu = this.onHideToolMenu.bind(this);
        this.onClickToolMenuItem = this.onClickToolMenuItem.bind(this);
        this.onMouseDownToolMenuItem = this.onMouseDownToolMenuItem.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.stUnsubscribe = SelectTargetStore.listen(this.onSelectTargetModeChange);
        this.onStatusChange(WidgetStore.getStore());
        window.addEventListener('keydown', this.itemWindowKeyAction);
        window.addEventListener('keyup', this.resetCmdKey);

        //右键menu
        window.addEventListener('mousedown', this.onHideToolMenu);
        window.addEventListener('click', this.onHideToolMenu);

        //多选
        window.addEventListener('blur', this.onMultiSelectKeyUp);
        window.addEventListener('keydown', this.onMultiSelectKeyDown);
        window.addEventListener('keyup', this.onMultiSelectKeyUp);
        document.getElementById('DesignView-Container').addEventListener('mousedown', this.onLeaveMultiSelectMode);
        document.getElementById('ObjectTree').addEventListener('mousedown', this.onLeaveMultiSelectMode);
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.stUnsubscribe();
        window.removeEventListener('keydown', this.itemWindowKeyAction);
        window.removeEventListener('keyup', this.resetCmdKey);

        //右键menu
        window.removeEventListener('mousedown', this.onHideToolMenu);
        window.addEventListener('click', this.onHideToolMenu);

        //多选
        window.removeEventListener('blur', this.onMultiSelectKeyUp);
        window.removeEventListener('keydown', this.onMultiSelectKeyDown);
        window.removeEventListener('keyup', this.onMultiSelectKeyUp);
        document.getElementById('DesignView-Container').removeEventListener('mousedown', this.onLeaveMultiSelectMode);
        document.getElementById('ObjectTree').removeEventListener('mousedown', this.onLeaveMultiSelectMode);
    }

    onStatusChange(widget) {
        //console.log("tree",widget);
        //initTree : 初始化对象树
        if (widget.initTree !== undefined){
            this.setState({
                widgetTree: widget.initTree[0],
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
        else if (widget.activeBlockMode) {
            this.setState({
                activeBlockMode: widget.activeBlockMode.on,
                activeBlockKey: widget.activeBlockMode.key,
            })
        }

        else if(widget.selectWidget || widget.selectFunction || widget.selectVariable || widget.selectDBItem){
            //触发失焦
            if(this.state.nid&&document.getElementById('tree-item-'+this.state.nid)){
                document.getElementById('tree-item-'+this.state.nid).blur();
            }
            let content = null;

            let activeFocus = (content)=>{
                this.setState(content, ()=>{
                    //触发聚焦
                    if(document.getElementById('tree-item-'+this.state.nid)){
                        document.getElementById('tree-item-'+this.state.nid).focus();
                    }
                });
            };

            if(widget.selectWidget){
                let content = {
                    selectWidget : widget.selectWidget,
                    nid : widget.selectWidget.key,
                    nodeType: nodeType.widget,
                    nids: []
                };
                activeFocus(content);
                this.addOpenId();
            } else if (widget.selectFunction) {
                let content = {
                    selectWidget: null,
                    nid: widget.selectFunction.key,
                    nodeType: nodeType.func,
                    nids: []
                };
                activeFocus(content);
            } else if (widget.selectVariable) {
                let content = {
                    selectWidget: null,
                    nid: widget.selectVariable.key,
                    nodeType: nodeType.var,
                    nids: []
                };
                activeFocus(content);
            } else if (widget.selectDBItem) {
                let content = {
                    selectWidget: null,
                    nid: widget.selectDBItem.key,
                    nodeType: nodeType.dbItem,
                    nids: []
                };
                activeFocus(content);
            }
        } else if(widget.activeEventTreeKey) {
            //激活对象key对应对象的事件树
            this.setState({
                activeEventTreeKey: widget.activeEventTreeKey.key
            })
        } else if(widget.selectWidgets) {
            let nids = [];
            widget.selectWidgets.forEach((v)=>{
                nids.push(v.key);
            });
            this.setState({
                nids: nids
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
        if(widget.historyPropertiesUpdate){
            this.forceUpdate();
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

    onSelectTargetMode(data){
        if(this.state.selectTargetMode) {
            if(this.state.targetList) {
                let hasTarget = false;
                this.state.targetList.forEach(v=> {
                    if (data.key === v.key) {
                        hasTarget = true;
                    }
                });
                WidgetActions['didSelectTarget'](data);
            };
            return true;
        }
        return false;
    }

    onSelectTargetModeChange(result) {
        if(result.stUpdate){
            this.setState({
                selectTargetMode: result.stUpdate.isActive,
                targetList: result.stUpdate.targetList,
                showToolMenu:false
            })
        }
    }

    checkAllSelectTarget(key) {
        if(this.state.targetList) {
            let getTarget = false;
            this.state.targetList.forEach((v)=>{
                if(key === v.key){
                    getTarget = true;
                }
            });
            if (getTarget) {
                return true;
            }
            return false;
        }
        return false;
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

    onMultiSelectKeyDown(e) {
        if(e.target.nodeName==='INPUT' || e.target.nodeName==='TEXTAREA') {
            return;
        }
        if(this.state.selectTargetMode) {
            return;
        }
        e = e || window.event;
        if(e.shiftKey||e.key==='Shift') {
            if(!this.state.multiSelectMode) {
                this.setState({
                    multiSelectMode: true
                })
            }
        }
    }

    onMultiSelectKeyUp(e) {
        if(e.target.nodeName==='INPUT' || e.target.nodeName==='TEXTAREA') {
            return;
        }
        e = e || window.event;
        if(e.shiftKey||e.key==='Shift'||(e.currentTarget === window&&e.type==='blur')) {
            if(this.state.multiSelectMode) {
                this.setState({
                    multiSelectMode: false
                })
            }
        }
    }

    isInMultiList(nid) {
        if(this.state.nids.indexOf(nid)>=0) {
            return true;
        }
        return false;
    }

    onLeaveMultiSelectMode(e) {
        if(e.target.nodeName==='INPUT' || e.target.nodeName==='TEXTAREA') {
            return;
        }
        if(!this.state.multiSelectMode) {
            this.setState({
                multiSelectMode: false
            }, ()=>{
                if(!this.state.selectTargetMode&&this.state.selectWidget&&this.state.nids.length>0) {
                    WidgetActions['selectWidget'](this.state.selectWidget, true);
                }
            });
        }
    }

    chooseBtn(nid, data, event){
        //console.log(data);
        if(this.onSelectTargetMode(data)) {
            if(event){ event.stopPropagation(); }
            return false;
        }
        if(event){ event.stopPropagation(); }
        this.setState({
            showToolMenu:false,
            editMode: false
        });

        if(this.state.multiSelectMode) {
            if((selectableClass.indexOf(data.className)>=0||isCustomizeWidget(data.className))&&
                !data.props.locked&&this.state.selectWidget) {
                if(!this.isInMultiList(nid)){
                    WidgetActions['selectWidget'](data, true, null, true);
                }
            }
        } else {
            if(this.state.nid !== nid || this.state.activeEventTreeKey) {
                this.setState({
                    nid : nid
                },()=>{
                    WidgetActions['selectWidget'](data, true);
                });
            }
        }
    }

    showHideBtn(data,bool,event){
        if(this.onSelectTargetMode(data)) {
            event.stopPropagation();
            return false;
        }
        if(this.state.multiSelectMode) {
            return false;
        }
        //console.log(data);
        data.props['visible'] = bool;
        data.node['visible'] = bool;
        WidgetActions['render']();
        this.forceUpdate();
    }

    lockBtn(nid, data,event) {
        if(this.onSelectTargetMode(data)) {
            event.stopPropagation();
            return false;
        }
        if(this.state.multiSelectMode) {
            return false;
        }
        if(nid === this.state.nid){
            WidgetActions['lockWidget']();
            WidgetActions['render']();
        }
    }

    eventBtn(nid, data,event) {
        if(this.onSelectTargetMode(data)) {
            event.stopPropagation();
            return false;
        }
        if(this.state.multiSelectMode&&this.state.nids.length>0) {
            return false;
        }
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

    onChangeReSrc(data) {
        if(this.onSelectTargetMode(data)) {
            event.stopPropagation();
            return false;
        }
        if(this.state.multiSelectMode&&this.state.nids.length>0) {
            return false;
        }
        if(data.className === 'image'||data.className === 'video') {
            this.onFileUpload(data.className);
        }
    }

    onFileUpload(className) {
        chooseFile(className, false, (w) => {
            if (w.files.length) {
                if (className == 'image' || className == 'video') {
                    let fileName = w.files[0].name;
                    let dot = fileName.lastIndexOf('.');
                    if (dot > 0) {
                        var ext = fileName.substr(dot + 1).toLowerCase();
                        if (ext == 'png' || ext == 'jpeg' || ext == 'jpg') {
                            fileName = fileName.substr(0, dot);
                        }
                    }
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        WidgetActions['changeResource'](fileName, e.target.result, className);
                    };
                    reader.readAsDataURL(w.files[0]);
                }
            }
        });
    }

    relocateToolMenu(className, clientX, clientY) {
        let list = JSON.parse(JSON.stringify(originToolMenuList));
        if(className === 'var' || className === 'func' || className === 'dbItem') {
            list.splice(3,1);
        }
        this.setState({
            showToolMenu: true,
            toolMenuList: list
        },()=>{
            if(this.refs['objectTree']&&this.refs['toolMenu']) {
                let containerWidth = this.refs['objectTree'].clientWidth;
                let containerHeight = this.refs['objectTree'].clientHeight;
                //菜单高度：278 宽度：132
                let menuWidth = 132;
                let menuHeight = 2;
                this.state.toolMenuList.forEach((group, gIndex)=>{
                    menuHeight+=3*2; //padding
                    menuHeight+=group.length*20; //items
                    if(gIndex!=this.state.toolMenuList.length-1) {
                        menuHeight+=1;
                    } //seperator
                });
                let clickX = clientX - this.getDeltaX(this.refs['objectTree']) + document.body.scrollLeft;
                let clickY = clientY - this.getDeltaY(this.refs['objectTree']) + document.body.scrollTop;
                if(containerWidth-clickX>menuWidth) {
                    this.refs['toolMenu'].style.left = clickX+'px';
                } else {
                    this.refs['toolMenu'].style.left = (clickX-menuWidth)+'px';
                }
                if(containerHeight-clickY>menuHeight) {
                    this.refs['toolMenu'].style.top = clickY+'px';
                } else {
                    this.refs['toolMenu'].style.top = (clickY-menuHeight)+'px';
                }
            }
        });
    }

    onRightClick(nid, data, type, e) {
        e.preventDefault();
        e.stopPropagation();
        if(this.onSelectTargetMode(data)) {
            return false;
        }
        if(this.state.multiSelectMode&&this.state.nids.length>0) {
            return false;
        }
        let clientX = e.clientX;
        let clientY = e.clientY;
        if(type===nodeType.widget) {
            this.chooseBtn(nid, data);
        } else {
            this.fadeWidgetBtn(nid, data, type);
        }

        this.relocateToolMenu(data.className, clientX, clientY);
    }

    onHideToolMenu() {
        this.setState({
            showToolMenu: false
        });
    }

    onMouseDownToolMenuItem(e) {
        e.stopPropagation();
    }

    onClickToolMenuItem(actionName, e) {
        e.stopPropagation();
        this.onHideToolMenu();
        switch (actionName) {
            case 'copy':
                this.itemActions('copy');
                break;
            case 'cut':
                this.itemActions('cut');
                break;
            case 'paste':
                this.itemActions('paste');
                break;
            case 'delete':
                this.itemActions('delete');
                break;
            case 'originSize':
                this.itemActions('originSize');
                break;
            case 'originPercent':
                this.itemActions('originPercent');
                break;
            case 'relPaste':
                this.itemActions('relPaste');
                break;
            case 'crossCopy':
                this.itemActions('crossCopy');
                break;
            case 'crossPaste':
                this.itemActions('crossPaste');
                break;
            case 'saveAsBlock':
                this.itemActions('saveAsBlock');
                break;
        }
    }

    fadeWidgetBtn(nid, data, type, event) {
        if(this.onSelectTargetMode(data)) {
            if(event){ event.stopPropagation(); }
            return false;
        }if(this.state.multiSelectMode) {
            return false;
        }
        switch (type){
            case nodeType.func:
                this.setState({
                    nid : nid,
                    editMode: false
                },()=>{
                    WidgetActions['selectWidget'](data.widget, false, keepType.func);
                    WidgetActions['selectFadeWidget'](data, nodeType.func);
                });
                break;
            case nodeType.var:
                this.setState({
                    nid : nid,
                    editMode: false
                },()=>{
                    WidgetActions['selectWidget'](data.widget, false, keepType.var);
                    WidgetActions['selectFadeWidget'](data, nodeType.var)
                });
                break;
            case nodeType.dbItem:
                this.setState({
                    nid : nid,
                    editMode: false
                },()=>{
                    WidgetActions['selectWidget'](data.widget, false, keepType.dbItem);
                    WidgetActions['selectFadeWidget'](data, nodeType.dbItem)
                });
                break;
        }
    }

    startEditObjName(id, data, event) {
        if(this.state.selectTargetMode||this.state.multiSelectMode){
            return;
        }

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
            }, 0);
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

    itemAddKeyListener(type, event){
        // this.itemRemoveKeyListener(type, event);
        if (type == 'root'){
            event.currentTarget.addEventListener('keydown', this.rootKeyAction);
            event.currentTarget.addEventListener('keyup', this.resetCmdKey);
        } else {
            event.currentTarget.addEventListener('keydown', this.itemKeyAction);
            event.currentTarget.addEventListener('keyup', this.resetCmdKey);
        }
        event.currentTarget.addEventListener('mousedown', (e)=>{
            e.stopPropagation();
        });
        event.currentTarget.addEventListener('keydown', this.onMultiSelectKeyDown);
        event.currentTarget.addEventListener('keyup', this.onMultiSelectKeyUp);
    }

    itemRemoveKeyListener(type, event){
        if (type == 'root'){
            event.currentTarget.removeEventListener('keydown', this.rootKeyAction);
            event.currentTarget.removeEventListener('keyup', this.resetCmdKey);
        } else {
            event.currentTarget.removeEventListener('keydown', this.itemKeyAction);
            event.currentTarget.removeEventListener('keyup', this.resetCmdKey);
        }
    }

    resetCmdKey() {
        let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        if (isMac) {
            this.didPressCmdKey = false;
        }
    }

    checkPressCmdKey(kC) {
        if(navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
            let saywho = function(){
                var ua = navigator.userAgent, tem,
                    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
                if (/trident/i.test(M[1])) {
                    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                    return { 'browser': 'IE', 'version': (tem[1] || '') };
                }
                if (M[1] === 'Chrome') {
                    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                    //if(tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
                    if (tem != null) return {'browser':tem.slice(1)[0].replace('OPR', 'Opera'), 'version': tem.slice(1)[1]}
                }
                M = M[2] ? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
                if ((tem = ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
                return { 'browser': M[0], 'version': M[1] };
            };
            let webkit = (saywho().browser === 'Chrome' || saywho().browser === 'Safari');
            let mozilla = saywho().browser === 'Firefox';
            let opera = saywho().browser === 'Opera';
            if (((webkit || opera) && (kC === 91 || kC === 93)) || (mozilla && kC === 224)) {
                this.didPressCmdKey = true;
            }
        }
    }

    itemActions(type) {
        //func,var,dbItem的处理
        if(type === 'paste'||type === 'originSize'|| type === 'originPercent') {
            //当前选中func or var就不理会
            if(this.state.nodeType === nodeType.func ||
                this.state.nodeType==nodeType.var ||
                this.state.nodeType == nodeType.dbItem) {
                return;
            }
        }

        //对db和sock处理
        if(this.state.selectWidget) {
            if(type !== 'delete') {
                if(this.state.selectWidget.className == "db"
                    || this.state.selectWidget.className == "sock"){
                    return ;
                }
            } else {
                if(this.state.selectWidget.className == "db"){
                    if(this.state.selectWidget.node.dbType = "shareDb"){
                        ReDbOrSockIdAction['reDbOrSockId']("db",this.state.selectWidget.node.dbid);
                    }
                }
                if(this.state.selectWidget.className == "sock"){
                    ReDbOrSockIdAction['reDbOrSockId']("sock",this.state.selectWidget.node.sid);
                }
            }
        }

        switch (type) {
            case 'copy':
                WidgetActions['copyTreeNode'](this.state.nodeType);
                break;
            case 'paste':
                WidgetActions['pasteTreeNode']();
                break;
            case 'cut':
                WidgetActions['cutTreeNode'](this.state.nodeType);
                break;
            case 'delete':
                WidgetActions['deleteTreeNode'](this.state.nodeType);
                break;
            case 'originSize':
                WidgetActions['originSizeTreeNode'](this.state.nodeType);
                break;
            case 'originPercent':
                WidgetActions['originPercentTreeNode'](this.state.nodeType);
                break;
            case 'relPaste':
                //TODO: WidgetActions['relPasteTreeNode'](this.state.nodeType);
                break;
            case 'crossCopy':
                //TODO: WidgetActions['crossCopyTreeNode'](this.state.nodeType);
                break;
            case 'crossPaste':
                //TODO: WidgetActions['crossPasteTreeNode'](this.state.nodeType);
                break;
            case 'saveAsBlock':
                WidgetActions['activeBlockMode'](true);
                break;
            default:
                break;
        }
    }

    itemWindowKeyAction(e) {
        //如果是input的话
        if(e.target.nodeName==='INPUT' || e.target.nodeName==='TEXTAREA') {
            return;
        }

        if(this.state.selectTargetMode||
            this.state.editMode||this.state.nids.length>0) {
            return;
        }

        let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        let didPressCtrl = (isMac && window.macKeys.cmdKey) || (!isMac && event.ctrlKey);

        let disable = false;
        if (this.state.selectWidget&&this.state.selectWidget.className === 'root') {
            disable = true;
        }

        //复制 67
        if (didPressCtrl && event.keyCode == 67 && !disable) {
            this.itemActions('copy');
        }
        //黏贴 86
        if (didPressCtrl && event.keyCode == 86) {
            this.itemActions('paste');
        }
        //剪切 88
        if (didPressCtrl && event.keyCode == 88 && !disable) {
            this.itemActions('cut');
        }
        //删除 delete
        if (!didPressCtrl && event.keyCode == 8 && !disable) {
            this.itemActions('delete');
        }
    }

    rootKeyAction(event){
        event.stopPropagation();
        this.checkPressCmdKey(event.keyCode);
        let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        let didPressCtrl = (isMac && this.didPressCmdKey) || (!isMac && event.ctrlKey);
        //黏贴
        if (didPressCtrl && event.keyCode == 86) {
            WidgetActions['pasteTreeNode']();
        }
    }

    itemKeyAction(event){
        event.stopPropagation();
        if(this.state.selectTargetMode||this.state.nids.length>0) {
            return;
        }

        //如果是edit模式，不做任何事情
        if(this.state.editMode){
            if(event.keyCode == 13) {
                this.onRename(event);
            }
            return;
        }

        this.checkPressCmdKey(event.keyCode);
        let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        let didPressCtrl = (isMac && this.didPressCmdKey) || (!isMac && event.ctrlKey);
        //复制 67
        if (didPressCtrl && event.keyCode == 67) {
            this.itemActions('copy');
        }
        //黏贴 86
        if (didPressCtrl && event.keyCode == 86) {
            this.itemActions('paste');
        }
        //剪切 88
        if (didPressCtrl && event.keyCode == 88) {
            this.itemActions('cut');
        }
        //删除 delete
        if (!didPressCtrl && event.keyCode == 8) {
            this.itemActions('delete');
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
        if(this.state.editMode|| this.state.selectTargetMode
            ||this.state.selectTargetMode||this.state.nids.length>0){
            e.preventDefault();
            return;
        }
        e.stopPropagation();
        this.initialDragTip('', false);
        if(this.state.nid !== nid){
            //拖动同时把item设为被选中
            this.setState({
                nid : nid,
                editMode: false
            },()=>{
                WidgetActions['selectWidget'](data, true);
            });
        }
        //初始化一下
        this.dragged = null;
        this.selectDragData = null;
        this.over = null;
        this.overPosition = null;
        this.selectDragData = data;
        this.dragged = e.currentTarget;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.dragged);
    }

    itemDragEnd(e){
        //如果是edit模式，不做任何事情
        if(this.state.editMode|| this.state.selectTargetMode
            ||this.state.selectTargetMode||this.state.nids.length>0){
            e.preventDefault();
            return;
        }
        e.stopPropagation();
        this.destroyDragTip();
        // 删除placeholder
        if(this.placeholder&&this.placeholder.parentElement) {
            this.placeholder.parentElement.removeChild(this.placeholder);
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

            if (!this.selectDragData) {
                return;
            }
            let destWidget = null;

            if(isNaN(destParentKey)) {
                //自定义模块
            } else if(destParentKey === -1) {
                //stage类
                destWidget = WidgetStore.findWidget(destKey);
                if(destWidget) {
                    if(!(srcParentKey === destKey && srcOrder === 0)) {
                        if(checkChildClass(destWidget, this.selectDragData.className)) {
                            WidgetActions['moveWidget'](this.selectDragData, destWidget, 0);
                        } 
                    }
                }
            } else if((srcKey == destKey && srcParentKey === destParentKey)) {
                //相同位置
            } else if (srcParentKey === destKey) {
                //目标为来源的父节点
                let pOrder = null;
                let pKey = null;
                switch (this.overPosition){
                    case overPosition.top:
                        pOrder = destOrder;
                        pKey = destParentKey;
                        break;
                    case overPosition.bot:
                        pOrder = ++destOrder;
                        pKey = destParentKey;
                        break;
                    case overPosition.mid:
                        pOrder = 0;
                        pKey = destKey;
                        break;
                }
                //如果本来在第0位就不做任何操作
                if(!(this.overPosition == overPosition.mid && srcOrder==0)) {
                    destWidget = WidgetStore.findWidget(pKey);
                    if(destWidget) {
                        if(checkChildClass(destWidget, this.selectDragData.className)) {
                            WidgetActions['moveWidget'](this.selectDragData, destWidget, pOrder);
                        }
                    }
                }
            } else if (srcKey !== destKey && srcParentKey === destParentKey){
                //同层同源
                switch (this.overPosition){
                    case overPosition.mid:
                        //放入同层元素即跨层
                        destWidget = WidgetStore.findWidget(destKey);
                        if(destWidget) {
                            if(checkChildClass(destWidget, this.selectDragData.className)) {
                                WidgetActions['moveWidget'](this.selectDragData, destWidget, 0);
                            }
                        }
                        break;
                    case overPosition.bot:
                        destOrder++;
                        if(srcOrder != destOrder) {
                            WidgetActions['reorderWidget'](srcOrder-destOrder>0?-(srcOrder-destOrder):-(srcOrder-(--destOrder)));
                        }
                        break;
                    default:
                        WidgetActions['reorderWidget'](srcOrder-destOrder>0?-(srcOrder-destOrder):-(srcOrder-(--destOrder)));
                        break;
                }
            } else {
                //跨层
                //看目标对象是否是src的子层元素之一
                let keyList = this.getChildrenKeys(this.selectDragData);
                if(!(keyList.indexOf(destKey)>=0)){
                    //不是的话就实现跨层
                    let pKey = null;
                    let pOrder = null;
                    switch (this.overPosition){
                        case overPosition.mid:
                            pKey = destKey;
                            pOrder = 0;
                            break;
                        case overPosition.bot:
                            pKey = destParentKey;
                            pOrder = ++destOrder;
                            break;
                        default:
                            pKey = destParentKey;
                            pOrder = destOrder;
                    }
                    destWidget = WidgetStore.findWidget(pKey);
                    if(destWidget) {
                        if(checkChildClass(destWidget, this.selectDragData.className)) {
                            //放入跨层元素内部
                            WidgetActions['moveWidget'](this.selectDragData, destWidget, pOrder);
                        }
                    }
                }
            }
            //最后清理一下
            this.dragged = null;
            this.selectDragData = null;
            this.over = null;
            this.overPosition = null;
        }
    }

    itemDragOver(e){
        //如果是edit模式，不做任何事情
        if(this.state.editMode||this.state.selectTargetMode
            ||this.state.selectTargetMode||this.state.nids.length>0){
            e.preventDefault();
            return;
        }

        //递归找到并获取名字叫item的div
        let findItemDiv = (target,cNameList) => {
            if(target) {
                if(cNameList.indexOf(target.className)>=0) {
                    return target;
                } else {
                    return findItemDiv(target.parentNode, cNameList);
                }
            } else {
                return null;
            }
        };
        //还原
        let restoreComponent = ()=> {
            if(this.over){
                this.over.style.backgroundColor = '';
            }
            if(this.placeholder){
                this.placeholder.style.display = 'block';
                this.placeholder.style.marginLeft = '';
            }
        };

        let setAllowMode = (changeByPosition) => {
            this.dragTip.innerHTML = tipAllow;
            if (changeByPosition) {
                switch (this.overPosition) {
                    case overPosition.top:
                    case overPosition.bot:
                        this.placeholder.style.backgroundColor = allowColor;
                        break;
                    case overPosition.mid:
                        this.over.style.backgroundColor = allowColor;
                        break;
                }
            }
        };

        let setForbiddenMode = (changeByPosition) => {
            this.dragTip.innerHTML = tipForbidden;
            if(changeByPosition) {
                switch (this.overPosition) {
                    case overPosition.top:
                    case overPosition.bot:
                        this.placeholder.style.backgroundColor = forbiddenColor;
                        break;
                    case overPosition.mid:
                        this.over.style.backgroundColor = forbiddenColor;
                        break;
                }
            }
        };

        let removePlaceHolder = ()=> {
            if(this.placeholder&&this.placeholder.parentElement) {
                this.placeholder.parentElement.removeChild(this.placeholder);
            }
        };

        let setPositionDefault = (position, layer)=> {
            this.overPosition = position;
            switch (this.overPosition){
                case overPosition.top:
                    this.over.style.backgroundColor = '';
                    this.placeholder.style.marginLeft = layer === '1' ? '' : layer * 20 + 22 + 'px';
                    this.over.parentNode.insertBefore(this.placeholder, this.over);
                    break;
                case overPosition.mid:
                    removePlaceHolder();
                    break;
                case overPosition.bot:
                    this.over.style.backgroundColor = '';
                    this.placeholder.style.marginLeft = layer === '1' ? '' : layer * 20 + 22 + 'px';
                    this.over.parentNode.appendChild(this.placeholder);
                    break;
            }
        };

        e.stopPropagation();
        this.dragWithTip(e.clientX, e.clientY, true);
        if(e.target.id === placeholderId) {
            this.placeholder.style.display = 'hidden';
            return;
        }
        restoreComponent();
        this.over = findItemDiv(e.target, ['item-title-wrap clearfix', 'stage-title-wrap clearfix']);
        if(this.over) {
            this.overPosition = null; //清除一下
            let destKey = Number(this.over.dataset.wkey);
            let destParentKey = Number(this.over.dataset.parentkey);
            let srcKey = Number(this.dragged.dataset.wkey);
            if (srcKey == destKey) {
                removePlaceHolder();
                setForbiddenMode(false);
            } else {
                if(isNaN(Number(destParentKey))) {
                    //自定义模块
                } else if(Number(destParentKey) === -1) {
                    //stage类
                    removePlaceHolder();
                    let destWidget = WidgetStore.findWidget(destKey);
                    this.overPosition = overPosition.mid;
                    if (destWidget&&!checkChildClass(destWidget, this.selectDragData.className)) {
                        setForbiddenMode(true);
                    } else {
                        setAllowMode(true);
                    }
                } else  {
                    let deltaTop = e.clientY - this.getDeltaY(this.over) + document.body.scrollTop;
                    let maxHeight = this.over.offsetHeight;
                    let layer = this.over.dataset.layer;
                    let mid1 = maxHeight / 3;
                    let mid2 = maxHeight * 2 / 3;
                    let pKey = null;
                    if (deltaTop >= 0 && deltaTop <= mid1) {
                        setPositionDefault(overPosition.top, layer);
                        pKey = destParentKey;
                    } else if (deltaTop > mid1 && deltaTop < mid2) {
                        setPositionDefault(overPosition.mid, layer);
                        pKey = destKey;
                    } else if (deltaTop >= mid2 && deltaTop <= maxHeight) {
                        setPositionDefault(overPosition.bot, layer);
                        pKey = destParentKey;
                    }
                    let keyList = this.getChildrenKeys(this.selectDragData);
                    if(keyList.indexOf(destKey)>=0){
                        //dest为src的内部元素
                        setForbiddenMode(true);
                    } else {
                        //父对象是否可添加
                        let destWidget = WidgetStore.findWidget(pKey);
                        if (destWidget&&!checkChildClass(destWidget, this.selectDragData.className)) {
                            //不可添加的对象
                            setForbiddenMode(true);
                        } else {
                            setAllowMode(true);
                        }
                    }
                }
            }
        }
    }

    getChildrenKeys(obj) {
        let keyList =[];
        let loopGetChildren = (w)=> {
            w.children.map(v=>{
                keyList.push(v.key);
                if(v.children&&v.children.length>0){
                    loopGetChildren(v);
                }
            });
        };
        loopGetChildren(obj);
        return keyList;
    }

    getDeltaY(obj){
        var ParentObj=obj;
        var top=obj.offsetTop;
        while(ParentObj=ParentObj.offsetParent){
            top+=ParentObj.offsetTop;
        }
        return top;
    }
    getDeltaX(obj){
        var ParentObj=obj;
        var left=obj.offsetLeft;
        while(ParentObj=ParentObj.offsetParent){
            left+=ParentObj.offsetLeft;
        }
        return left;
    }

    addModuleBtn(event){
        event.stopPropagation();
        event.preventDefault();
        let name = "_" + event.currentTarget.getAttribute("data-name");
        let select = this.state.selectWidget;
        if(
            (select.className == "root" && select.props.name!== "stage")
            || (select.className.charAt(0) == "_" && select.props.name.charAt(0) == "_")
        ) return;

        WidgetActions['addWidget'](name);
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
                           onClick={this.eventBtn.bind(this,nid,data)}
                           onContextMenu={this.onRightClick.bind(this, nid, data, nodeType.widget)}></div>;
            return btn;
        };

        let fadeWidgetList = (data, num, type)=> {
            let content = data.map((item, i)=> {
                let isEventTarget = this.checkAllSelectTarget(item.key);
                return <div className={$class('fade-widget-title-wrap clearfix',
                            {'allow-event-target': isEventTarget&&this.state.selectTargetMode},
                            {'forbidden-event-target': !isEventTarget&&this.state.selectTargetMode})}
                            key={i}
                            id={'tree-item-'+ item.key}
                            tabIndex={item.key}
                            onFocus={this.itemAddKeyListener.bind(this, 'item')}
                            onBlur={this.itemRemoveKeyListener.bind(this, 'item')}>
                    <div className={$class('fade-widget-title f--h f--hlc',
                        {'active': item.key === this.state.nid})}
                         onClick={this.fadeWidgetBtn.bind(this, item.key, item, type)}
                         onContextMenu={this.onRightClick.bind(this, item.key, item, type)}
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
                             onClick={this.fadeWidgetBtn.bind(this, item.key, item, type)}
                             onContextMenu={this.onRightClick.bind(this, item.key, item, type)}></div>
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
            let picIsImage = false;
            this.refs.ComponentPanel.panels[0].cplist.forEach((v1,i2)=>{
                if(isCustomizeWidget(v.className)) {
                    pic = 'component-icon';
                }
                else if(v.className == 'db'){
                    if(v.node.dbType == "shareDb"){
                        pic = 'shareDb-icon';
                    }
                    else {
                        pic = 'personalDb-icon';
                    }
                }
                else if(v.className === 'data'){
                    if(v.props.type === dataType.twoDArr) {
                        pic = 'twoDArr-icon';
                    } else if (v.props.type === dataType.oneDArr) {
                        pic = 'oneDArr-icon';
                    }
                }
                else if(v.className === 'sock'){
                    pic = 'sock-icon';
                }
                else if (v1.className === v.className){
                    if(v.className === 'image' || v.className === 'imagelist') {
                        if(v.props.link !== undefined &&
                            v.rootWidget.imageList&&
                            v.rootWidget.imageList.length>v.props.link){
                            if(v.className === 'imagelist') {
                                pic = v.rootWidget.imageList[v.props.link][0];
                            } else {
                                pic = v.rootWidget.imageList[v.props.link];
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
            });

            let isEventTarget = this.checkAllSelectTarget(v.key);
            return  <div className='item'
                         key={i}>
                <div className={$class('item-title-wrap clearfix',
                    {'allow-event-target': isEventTarget&&this.state.selectTargetMode},
                    {'forbidden-event-target': !isEventTarget&&this.state.selectTargetMode})}
                     id={'tree-item-'+ v.key}
                     tabIndex={v.key}
                     data-order={i}
                     data-layer={num}
                     data-wKey={v.key}
                     data-parentKey={v.parent.key}
                     draggable='true'
                     onDragStart={this.itemDragStart.bind(this,v.key, v)}
                     onDragEnd={this.itemDragEnd}
                     onFocus={this.itemAddKeyListener.bind(this, 'item')}
                     onBlur={this.itemRemoveKeyListener.bind(this, 'item')}>
                    <div className={$class('item-title f--h f--hlc',{'active': v.key === this.state.nid ||this.isInMultiList(v.key)})}
                         onClick={this.chooseBtn.bind(this,v.key, v)}
                         onContextMenu={this.onRightClick.bind(this, v.key, v, nodeType.widget)}
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
                            picIsImage
                                ? <span className="item-icon2">
                                    <img className="item-img" src={ pic } onDoubleClick={this.onChangeReSrc.bind(this, v)}/>
                                  </span>
                                : <span className={$class('item-icon', pic)}/>
                        }
                        {
                            isCustomizeWidget(v.className) || v.className == 'db'|| v.className == "sock"
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
                                : <div className={$class('item-event-empty',{'active': v.key === this.state.nid||this.isInMultiList(v.key)})}
                                       onClick={this.chooseBtn.bind(this,v.key, v)}
                                       onContextMenu={this.onRightClick.bind(this, v.key, v, nodeType.widget)}></div>
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
            <div id={'ObjectTree'} className={$class('ObjectTree',
                {'selectTargetMode': this.state.selectTargetMode})} ref="objectTree">
                <div className={$class("stage")} >
                {
                     !allTreeData
                        ? null
                        : allTreeData.map((v,i)=>{
                             let isRootEventTarget = this.checkAllSelectTarget(v.tree.key);
                             return  <div className='stage-item' key={i}
                                          onDragOver={this.itemDragOver}>
                                 <div className={$class('stage-title-wrap clearfix',
                                     {'allow-event-target': isRootEventTarget&&this.state.selectTargetMode},
                                     {'forbidden-event-target': !isRootEventTarget&&this.state.selectTargetMode})}
                                      id={'tree-item-'+ v.tree.key}
                                      tabIndex={v.tree.key}
                                      data-wKey={v.tree.key}
                                      data-parentKey={i==0?'-1':'custom'}
                                      onFocus={this.itemAddKeyListener.bind(this, 'root')}
                                      onBlur={this.itemRemoveKeyListener.bind(this, 'root')}>
                                     <div className={$class('stage-title f--h f--hlc',{'active': v.tree.key === this.state.nid})}
                                          style={{ width : this.props.width - 36 - 24 }}
                                          onClick={this.chooseBtn.bind(this, v.tree.key, v.tree)}
                                          onContextMenu={this.onRightClick.bind(this, v.tree.key, v.tree, nodeType.widget)}>
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
                                                 :  <div className='stage-name-wrap stage-module f--hlc'>
                                                        <p className="flex-1">{ v.tree.props.name }</p>
                                                        <span className="add-module-btn"
                                                              data-name={v.tree.props.name}
                                                              onClick={ this.addModuleBtn.bind(this)} />
                                                    </div>
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
                                 <div className={$class('stage-content clearfix', {'hidden':  this.state.openData.indexOf(v.tree.key) < 0 })}>
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
                {
                    !this.state.showToolMenu
                        ? null
                        : <div className="tool-menu"
                               ref="toolMenu">
                        {
                            this.state.toolMenuList.map((v,i)=>{
                                return <div key={i} className={$class("menu-group",
                                    {'menu-group-border':i!=this.state.toolMenuList.length-1})}>
                                    {
                                        v.map((v1,i1)=>{
                                           return <div key={i1} className="menu-item f--hlc"
                                                       onMouseDown={this.onMouseDownToolMenuItem.bind(this)}
                                                       onClick={this.onClickToolMenuItem.bind(this, v1.name)}>
                                               {v1.showName}
                                               </div>;
                                        })
                                    }
                                </div>;
                            })
                        }
                    </div>
                }

                <div className='hidden'>
                    <ComponentPanel ref='ComponentPanel' />
                </div>
            </div>
        );
    }
}

module.exports = ObjectTree;