//对象树
import React from 'react';
import $class from 'classnames';

import ComponentPanel from '../ComponentPanel';
import WidgetActions from '../../actions/WidgetActions';
import WidgetStore, {nodeType, isCustomizeWidget} from '../../stores/WidgetStore';

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

        //函数相关
        this.funcBtn = this.funcBtn.bind(this);
        this.varBtn = this.varBtn.bind(this);

        this.startEditObjName = this.startEditObjName.bind(this);
        this.endEditObjName = this.endEditObjName.bind(this);
        this.editStopPropagation = this.editStopPropagation.bind(this);
        this.onRename = this.onRename.bind(this);

        //拖动对象的方法
        this.itemDragStart = this.itemDragStart.bind(this);
        this.itemDragEnd = this.itemDragEnd.bind(this);
        this.itemDragOver = this.itemDragOver.bind(this);
        //拖动时显示的tip
        this.dragWithTip = this.dragWithTip.bind(this);
        this.initialDragTip = this.initialDragTip.bind(this);
        this.destroyDragTip = this.destroyDragTip.bind(this);
        //有关拖动的相关参数
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'placeholder';
        this.dragTip = document.createElement('div');
        this.dragTip.className = 'dragTip';
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
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

        else if(widget.selectWidget || widget.selectFunction || widget.selectVariable){
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

    chooseBtn(nid, data){
        //console.log(data);
        this.setState({
            nid : nid,
            editMode: false
        },()=>{
            WidgetActions['selectWidget'](data, true);
        });
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
                WidgetActions['selectWidget'](data, true);
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

    funcBtn(nid, data) {
        this.setState({
            nid : nid,
            editMode: false
        },()=>{
            WidgetActions['selectWidget'](data.widget, false);
            WidgetActions['selectFunction'](data);
        });
    }

    varBtn(nid, data) {
        this.setState({
            nid : nid,
            editMode: false
        },()=>{
            WidgetActions['selectWidget'](data.widget, false);
            WidgetActions['selectVariable'](data);
        });
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
            WidgetActions['renameTreeNode'](this.state.nodeType, event.target.value);
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
            if(this.state.nodeType === nodeType.func || this.state.nodeType==nodeType.var) {
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
        document.getElementById('iH5-App').appendChild(this.dragTip);
        isShow?this.dragTip.style.display='block':this.dragTip.style.display='none';
    }

    destroyDragTip(){
        this.dragTip.innerHTML = '';
        this.dragTip.style.display = 'none';
        this.dragTip.parentNode.removeChild(this.dragTip);
    }

    itemDragStart(nid, data, e){
        //如果是edit模式，不做任何事情
        if(this.state.editMode){
            e.preventDefault();
            return;
        }

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

        this.destroyDragTip();
        this.dragged.style.display = 'block';
        this.dragged.parentNode.removeChild(this.placeholder);
        // update state
        let from = Number(this.dragged.dataset.keyid);
        let to = Number(this.over.dataset.keyid);
        if (from != to){
            WidgetActions['reorderWidget'](from-to>0?-(from-to):-(from-(--to)));
        }
    }

    itemDragOver(e){
        //如果是edit模式，不做任何事情
        if(this.state.editMode){
            e.preventDefault();
            return;
        }

        this.dragWithTip(e.clientX, e.clientY, true);
        this.dragged.style.display = 'none';
        if(e.target.className === 'placeholder') return;
        //递归找到并获取名字叫item的div
        let findItemDiv = (target,cName) => {
            if(target.className === cName) {
                return target;
            }
            return findItemDiv(target.parentNode, cName);
        };
        this.over = findItemDiv(e.target, 'item');
        this.over.parentNode.insertBefore(this.placeholder, this.over);
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

        let funcList = (data, num)=> {
            let content = data.map((item, i)=> {
                return <div className={"func-title-wrap clearfix"} key={i}
                            id={'tree-item-'+ item.key}
                            tabIndex={item.key}
                            onFocus={this.itemAddKeyListener.bind(this)}
                            onBlur={this.itemRemoveKeyListener.bind(this)}>
                    <div className={$class('func-title f--h f--hlc',
                         {'active': item.key === this.state.nid})}
                         onClick={this.funcBtn.bind(this, item.key, item)}
                         style={{ paddingLeft: num === 0 ? '28px' :num *20 + 22 +'px', width : this.props.width - 36 - 24  }}>
                        <span className='item-icon func-var-icon func-icon' />
                        <div className='func-name-wrap' onDoubleClick={this.startEditObjName.bind(this, item.key, item)}>
                            <p className={$class({'hidden':((item.key === this.state.nid)&&this.state.editMode)})} >{item.props.name}</p>
                            <input id={'item-name-input-'+item.key} type="text"
                                   onBlur={this.endEditObjName}
                                   onClick={this.editStopPropagation}
                                   className={$class('item-name-input',{'hidden':!((item.key === this.state.nid)&&this.state.editMode)})}/>
                        </div>
                    </div>
                    <div className={$class('item-event')}>
                        <div className={$class('item-event-empty',{'active': item.key === this.state.nid})}
                             onClick={this.funcBtn.bind(this, item.key, item)}></div>
                    </div>
                </div>
            });
            return content
        };

        let varList = (data, num)=> {
            let content = data.map((item, i)=> {
                return <div className="var-title-wrap clearfix" key={i}
                            id={'tree-item-'+ item.key}
                            tabIndex={item.key}
                            onFocus={this.itemAddKeyListener.bind(this)}
                            onBlur={this.itemRemoveKeyListener.bind(this)}>
                    <div className={$class('func-title f--h f--hlc',
                        {'active': item.key === this.state.nid})}
                         onClick={this.varBtn.bind(this, item.key, item)}
                         style={{ paddingLeft: num === 0 ? '28px' :num *20 + 22 +'px', width : this.props.width - 36 - 24  }}>
                        <span className={$class('item-icon func-var-icon', {'var-num-icon': item.type==='number'},
                            {'var-str-icon': item.type==='string'})} />
                        <div className='var-name-wrap' onDoubleClick={this.startEditObjName.bind(this, item.key, item)}>
                            <p className={$class({'hidden':((item.key === this.state.nid)&&this.state.editMode)})} >{item.props.name}</p>
                            <input id={'item-name-input-'+item.key} type="text"
                                   onBlur={this.endEditObjName}
                                   onClick={this.editStopPropagation}
                                   className={$class('item-name-input',{'hidden':!((item.key === this.state.nid)&&this.state.editMode)})}/>
                        </div>
                    </div>
                    <div className={$class('item-event')}>
                        <div className={$class('item-event-empty',{'active': item.key === this.state.nid})}
                             onClick={this.varBtn.bind(this, item.key, item)}></div>
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
                if(isCustomizeWidget(v.className)&&v1.className==='component') {
                    pic = 'componet-icon';
                    picIsImage = false;
                } else if (v1.className === v.className){
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
                         data-keyId={i}
                         draggable='true'
                         onDragStart={this.itemDragStart.bind(this,v.key, v)}
                         onDragEnd={this.itemDragEnd}>
                <div className='item-title-wrap clearfix'
                     id={'tree-item-'+ v.key}
                     tabIndex={v.key}
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
                                ? icon( 1 , v.key)
                                : icon( 0 , v.key)
                        }
                        {
                            picIsImage?<span className="item-icon"><img className="item-img" src={ pic } /></span>
                                : <span className={$class('item-icon', pic)} />
                        }
                        {
                            isCustomizeWidget(v.className)
                                ? <div className='item-name-wrap'>
                                    <p>{v.props.name}</p>
                                  </div>
                                : <div className='item-name-wrap' onDoubleClick={this.startEditObjName.bind(this, v.key, v)}>
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
                <div className={$class('item-var-content clearfix', {'hidden': this.state.openData.indexOf(v.key) < 0 })}>
                    {v.intVarList.length === 0
                        ? null
                        : varList(v.intVarList, num+1)
                    }
                </div>
                <div className={$class('item-var-content clearfix', {'hidden': this.state.openData.indexOf(v.key) < 0 })}>
                    {v.strVarList.length === 0
                        ? null
                        : varList(v.strVarList, num+1)
                    }
                </div>
                <div className={$class('item-function-content clearfix', {'hidden': this.state.openData.indexOf(v.key) < 0 })}>
                    {v.funcList.length === 0
                        ? null
                        : funcList(v.funcList, num+1)
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
                                         <div className='stage-name-wrap'>
                                             <p>{ v.name }</p>
                                         </div>
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
                                 <div className={$class('stage-var-content clearfix', {'hidden':  this.state.openData.indexOf(v.tree.key) < 0 })}>
                                     {v.tree.intVarList.length === 0
                                         ? null
                                         : varList(v.tree.intVarList, 1)
                                     }
                                 </div>
                                 <div className={$class('stage-var-content clearfix', {'hidden':  this.state.openData.indexOf(v.tree.key) < 0 })}>
                                     {v.tree.strVarList.length === 0
                                         ? null
                                         : varList(v.tree.strVarList, 1)
                                     }
                                 </div>
                                 <div className={$class('stage-function-content clearfix', {'hidden':  this.state.openData.indexOf(v.tree.key) < 0 })}>
                                     {v.tree.funcList.length === 0
                                         ? null
                                         : funcList(v.tree.funcList, 1)
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