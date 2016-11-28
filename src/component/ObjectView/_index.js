//对象视图（工具右边对象树、资源等）

import React from 'react';
import $class from 'classnames';

//import Outline from './Outline';
//import ParamsPanel from './ParamsPanel';
import ObjectTree from './ObjectTree';
import Resource from './Resource';
import Animation from './Animation';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

import ReDbOrSockIdAction from "../../actions/ReDbOrSockIdAction";

import {checkChildClass, checkEventClass, checkLockClass, checkNotInDomMode} from '../PropertyMap';

import DrawRect from '../ToolBox/DrawRect';
import bridge from 'bridge';

class ObjectView extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            whichContent : 0,
            whichContentData : ["对象树","资源"],
            width : null,
            parentID : null,
            parentData : null,
            currentNode : null, //当前的节点，可以为function，widget或variable
            canLock: false, //是否可有锁
            locked: false,  //是否已锁
            canDelete: false,   //是否可删除
            canHaveEventTree: false,    //是否可有事件树
            hasEventTree: false, //是否有事件树
            activeEventTreeKey: null, //激活事件的key
            enableContainer: true,
            enablePage: true,
            hideDomType: false
        };
        this.toggleBtn = this.toggleBtn.bind(this);
        this.create = this.create.bind(this);
        this.delete = this.delete.bind(this);
        this.lock = this.lock.bind(this);
        this.initEvent = this.initEvent.bind(this);
        this.dragLeftBtn = this.dragLeftBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onInitLock = this.onInitLock.bind(this);
        this.onInitHasEventTree = this.onInitHasEventTree.bind(this);
        this.onInitDelete = this.onInitDelete.bind(this);
        this.onInitDomType = this.onInitDomType.bind(this);
        this.onInitButtons = this.onInitButtons.bind(this);

        this.drawRect = null;
        this.onDrawRect = this.onDrawRect.bind(this);
    }

    componentDidMount() {
        this.dragLeftBtn();
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if(widget.redrawTree) {
            if(this.state.currentNode&&!this.state.currentNode.widget){
                this.onInitButtons(this.state.currentNode);
            }
        }
        if(widget.redrawWidget) {
            this.onInitButtons(widget.redrawWidget);
        }
        if(widget.selectWidget){
            this.setState({
                currentNode : widget.selectWidget,
                enableContainer: widget.selectWidget.props.block?false:checkChildClass(widget.selectWidget, 'container'),
                enablePage: widget.selectWidget.props.block?false:checkChildClass(widget.selectWidget, 'page')
            });
            if(widget.selectWidget.parent){
                this.setState({
                    parentID : widget.selectWidget.parent.key,
                    parentData : widget.selectWidget.parent,
                });
            }
            this.onInitButtons(widget.selectWidget);
        } else if (widget.selectFunction) {
            this.setState({
                currentNode : widget.selectFunction,
                enableContainer: checkChildClass(widget.selectFunction, 'container'),
                enablePage: checkChildClass(widget.selectFunction, 'page')
            });
            this.onInitButtons(widget.selectFunction);
        } else if (widget.selectVariable) {
            this.setState({
                currentNode : widget.selectVariable,
                enableContainer: checkChildClass(widget.selectVariable, 'container'),
                enablePage: checkChildClass(widget.selectVariable, 'page')
            });
            this.onInitButtons(widget.selectVariable);
        } else if (widget.selectDBItem) {
            this.setState({
                currentNode : widget.selectDBItem,
                enableContainer: checkChildClass(widget.selectDBItem, 'container'),
                enablePage: checkChildClass(widget.selectDBItem, 'page')
            });
            this.onInitButtons(widget.selectDBItem);
        } else if(widget.activeEventTreeKey) {
            this.setState({
                activeEventTreeKey: widget.activeEventTreeKey.key
            })
        }
        if(widget.historyPropertiesUpdate){
            this.forceUpdate();
        }
    }

    onInitButtons(selectWidget){
        this.onInitLock(selectWidget);
        this.onInitHasEventTree(selectWidget);
        this.onInitDelete(selectWidget);
        this.onInitDomType(selectWidget);
    }

    onInitHasEventTree(selectWidget){
        let hasEventTree = false;
        let canHaveEventTree = true;
        // 暂时小模块去除
        // if(!checkEventClass(selectWidget)) {
        if(!checkEventClass(selectWidget)||selectWidget.props.block) {
            canHaveEventTree = false;
            hasEventTree = false;
        } else if ((!selectWidget.props.block&&selectWidget.props.eventTree)
            || (selectWidget.props.block&&selectWidget.props.block.eventTree)) {
            hasEventTree = true;
        }
        this.setState({
            hasEventTree: hasEventTree,
            canHaveEventTree: canHaveEventTree
        });
    }

    onInitLock(selectWidget) {
        let canLock = false;
        if(!checkLockClass(selectWidget)) {
            canLock = false;
        } else {
            canLock = true;
        }
        this.setState({
            canLock: canLock,
            locked: selectWidget.props.locked
        });
    }

    onInitDelete(selectWidget) {
        let canDelete = false;
        if(selectWidget.className === 'root'&&selectWidget.props.isStage) {
            canDelete = false;
        } else {
            canDelete = true;
        }
        this.setState({
            canDelete: canDelete
        });
    }

    onInitDomType(selectWidget) {
        this.setState({
            hiddenDomType: checkNotInDomMode(selectWidget, 'page')
        })
    }

    toggleBtn(i){
        this.setState({
            whichContent : i
        })
    }

    onDrawRect(className,param) {
        this.drawRect = new DrawRect();
        this.drawRect.start(this.state.currentNode);
        this.drawRect.def.promise.then(data => {
            if(param) {
                param.positionX = data.positionX;
                param.positionY = data.positionY;
                param.shapeWidth = data.shapeWidth;
                param.shapeHeight = data.shapeHeight;
                // param.width = param.width?param.width:data.width;
                // param.height = param.height?param.height:data.height;
                param.originX = 0;
                param.originY = 0;
                // param.positionX += param.shapeWidth*0.5;
                // param.positionY += param.shapeHeight*0.5;
            }
            WidgetActions['addWidget'](className, param);
            this.drawRect.end();
            this.drawRect.cleanUp();
            this.drawRect = null;
        },(() => {
            this.drawRect.end();
            this.drawRect.cleanUp();
            this.drawRect = null;
        }));
    }

    create(className,param){
        let widget =  this.state.currentNode;
        if(this.state.currentNode) {
            if(widget.className === 'var'||widget.className === 'func'||widget.className === 'DBItem') {
                widget = widget.widget;
            }
        }
        let isInDom = bridge.getRendererType(widget.node) == 2;
        let isInCanvas = bridge.getRendererType(widget.node) == 4;
        if(className==='container'&&(isInDom||isInCanvas)) {
            //点击的时候清除一下overlay
            new DrawRect().cleanUp();
            //某些情况的画框处理
            this.onDrawRect(className,param);
        } else {
            WidgetActions['addWidget'](className,param);
        }
    }

    initEvent(className,param) {
        this.setState({
            hasEventTree: !this.state.hasEventTree
        }, ()=>{
            WidgetActions['initEventTree'](className,param);
        });
    }

    lock() {
        this.setState({
            locked: !this.state.locked
        }, ()=>{
            WidgetActions['lockWidget']();
        });
    }

    delete(){
        if(this.state.activeEventTreeKey != null) {
            WidgetActions['removeEventTree']();
            WidgetActions['selectWidget'](this.state.currentNode);
        } else {
            WidgetActions['deleteTreeNode'](this.state.currentNode.className);
            if(this.state.currentNode.className == "db"){
                if(this.state.currentNode.node.dbType == "shareDb"){
                    ReDbOrSockIdAction['reDbOrSockId']("db",this.state.currentNode.node.dbid);
                }
            }
            if(this.state.currentNode.className == "sock"){
                ReDbOrSockIdAction['reDbOrSockId']("sock",this.state.currentNode.node.sid);
            }
        }
    }

    dragLeftBtn(){
        let move = false;
        let _x;
        let self = this;
        let initialWidth = 280;
        document.querySelector(".drag-left").addEventListener('mousedown', function mousedownFn(e){
            move=true;
            _x=e.pageX;
            const documentMousemove = function documentMousemove(e){
                if(move){
                    let x = -( e.pageX - _x);
                    self.setState({
                        width : initialWidth + x
                    });
                }
            };
            document.addEventListener('mousemove', documentMousemove);
            document.addEventListener('mouseup',function documentMouseup(){
                move=false;
                initialWidth = self.state.width <=280 ? 280 : self.state.width;
                document.removeEventListener('mousemove', documentMousemove);
                document.removeEventListener('mouseup', documentMouseup);
            });
        });
    }

    render() {
        let content;
        switch (this.state.whichContent){
            case 0 :
                content = <ObjectTree width = { this.state.width } ref='ObjectTree'/>;
                break;
            case 1 :
                content = <Resource />;
                break;
        }

        return (
            <div className='ObjectView' style={{width:this.state.width}}>
                <div className='drag-left'></div>

                <nav className='ov--nav f--h'>
                    <ul className='ul-clear flex-1 f--h'>
                        {
                            this.state.whichContentData.map((v,i)=>{
                                return  <li key={i}
                                            className={$class({ 'active': i === this.state.whichContent})}
                                            onClick={ this.toggleBtn.bind(this, i) }>
                                            {v}
                                        </li>
                            })
                        }
                    </ul>

                    <button className='btn btn-clear' title='收起' />
                </nav>

                <div className='ov--main f--h'>
                    <div className='ov--content flex-1'>
                        { content }
                    </div>

                    <Animation />
                </div>

                <div className='ov--footer f--h f--hlc'>
                    <button className={$class('btn btn-clear lock-btn',
                            {'not-allowed': !this.state.canLock||this.state.whichContent===1, 'locked': this.state.locked})}
                            onClick={this.lock.bind(this)}
                            title='锁住'
                            disabled={!this.state.canLock}/>
                    {/*<button className="btn btn-clear folder-btn" title="文件夹"  onClick={ this.create.bind(this,"folder",null)}  />*/}
                    <button className={$class('btn btn-clear container-btn',
                            {'not-allowed':!this.state.enableContainer})}
                            title='容器'
                            disabled={!this.state.enableContainer}
                            onClick={ this.create.bind(this,'container',{})} />
                    <button className={$class('btn btn-clear event-btn',
                            {'not-allowed': !this.state.canHaveEventTree||this.state.hasEventTree})}
                            title='事件'
                            disabled={!this.state.canHaveEventTree||this.state.hasEventTree}
                            onClick={ this.initEvent.bind(this, 'event', null)}/>
                    <button className={$class('btn btn-clear page-btn',
                            {'hidden': this.state.hiddenDomType},
                            {'not-allowed':!this.state.enablePage})}
                            title='页面'
                            disabled={!this.state.enablePage}
                            onClick={ this.create.bind(this,'page', {})} />
                    <button className={$class('btn btn-clear delete-btn',
                                {'not-allowed': !this.state.canDelete&&this.state.activeEventTreeKey== null})}
                            disabled={!this.state.canDelete&&this.state.activeEventTreeKey== null}
                            title='删除' onClick={ this.delete } />
                </div>

                {
                    //<Outline />
                    //<br />
                    //<ParamsPanel />
                }
            </div>
        );
    }
}

module.exports = ObjectView;
