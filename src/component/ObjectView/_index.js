//对象视图（工具右边对象树、资源等）

import React from 'react';
import $class from 'classnames';
import $ from 'jquery';

//import Outline from './Outline';
//import ParamsPanel from './ParamsPanel';
import ObjectTree from './ObjectTree';
import Resource from './Resource';
import Animation from './Animation';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class ObjectView extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            whichContent : 0,
            whichContentData : ["对象树","资源"],
            width : null,
            parentID : null,
            parentData : null,
            currentWidget : null,
            canLock: false, //是否可有锁
            locked: false,  //是否已锁
            canHaveEvent: false,    //是否可有事件
            hasEvent: false, //是否有事件
            hasActiveEvent: false //是否有激活的事件
        };
        this.toggleBtn = this.toggleBtn.bind(this);
        this.create = this.create.bind(this);
        this.delete = this.delete.bind(this);
        this.lock = this.lock.bind(this);
        this.addEvent = this.addEvent.bind(this);
        this.triggerEventActive = this.triggerEventActive.bind(this);
        this.dragLeftBtn = this.dragLeftBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onInitLock = this.onInitLock.bind(this);
        this.onInitHasEvent = this.onInitHasEvent.bind(this);
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
        //获取选中图层的父级id
        if(widget.selectWidget){
            this.setState({
                currentWidget : widget.selectWidget
            });
            if(widget.selectWidget.parent){
                this.setState({
                    parentID : widget.selectWidget.parent.key,
                    parentData : widget.selectWidget.parent,
                });
            }
            this.onInitLock(widget.selectWidget);
            this.onInitHasEvent(widget.selectWidget);
        }
    }

    onInitHasEvent(selectWidget){
        let hasEvent = false;
        let canHaveEvent = true;
        // if(selectWidget.className === 'root') {
        //     canHaveEvent = false;
        //     hasEvent = false;
        // } else
        if (Object.keys(selectWidget.events).length > 0) {
            hasEvent = true;
        }
        this.setState({
            hasEvent: hasEvent,
            canHaveEvent: canHaveEvent
        });
    }

    onInitLock(selectWidget) {
        let canLock = false;
        if(selectWidget.className === 'root') {
            canLock = false;
        } else {
            canLock = true;
        }
        this.setState({
            canLock: canLock,
            locked: selectWidget.props.locked
        });
    }

    toggleBtn(i){
        this.setState({
            whichContent : i
        })
    }

    create(className,param){
        WidgetActions['addWidget'](className,param);
    }

    addEvent(className,param) {
        WidgetActions['addEvent'](className,param);
        this.setState({
            hasEvent: !this.state.hasEvent
        });
    }

    triggerEventActive(active){
        this.setState({
            hasActiveEvent: active
        }, ()=>{
            this.props.triggerEventActive(active);
        });
    }

    lock() {
        WidgetActions['lockWidget']();
        this.setState({
            locked: !this.state.locked
        });
    }

    delete(){
        if(this.state.hasActiveEvent) {
            WidgetActions['removeEvents']();
            WidgetActions['selectWidget'](this.state.currentWidget);
        } else {
            WidgetActions['removeWidget']();
            this.refs.ObjectTree.chooseBtn(this.state.parentID, this.state.parentData);
        }

    }

    dragLeftBtn(){
        let move = false;
        let _x;
        let self = this;
        let initialWidth = 280;
        $(".drag-left").mousedown(function(e){
            move=true;
            _x=e.pageX;
        });
        $(document).mousemove(function(e){
            if(move){
                let x = -( e.pageX - _x);
                self.setState({
                    width : initialWidth + x
                });
            }
        }).mouseup(function(){
            move=false;
            initialWidth = self.state.width <=280 ? 280 : self.state.width;
        });
    }

    render() {
        let content;
        switch (this.state.whichContent){
            case 0 :
                content = <ObjectTree width = { this.state.width } ref='ObjectTree' triggerEventActive={this.triggerEventActive}/>;
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
                    <button className={$class(
                        'btn btn-clear lock-btn',
                        {'not-allowed': !this.state.canLock||this.state.whichContent===1, 'locked': this.state.locked})}
                            onClick={this.lock.bind(this)} title='锁住' disabled={!this.state.canLock}/>
                    {/*<button className="btn btn-clear folder-btn" title="文件夹"  onClick={ this.create.bind(this,"folder",null)}  />*/}
                    <button className='btn btn-clear container-btn' title='容器' onClick={ this.create.bind(this,'container',null)} />
                    <button className={$class(
                        'btn btn-clear event-btn',
                        {'not-allowed': !this.state.canHaveEvent||this.state.hasEvent}
                        )} title='事件' disabled={!this.state.canHaveEvent||this.state.hasEvent}
                            onClick={ this.addEvent.bind(this, 'event', null)}/>
                    {/*<button className='btn btn-clear new-btn' title='新建'  onClick={ this.create.bind(this,'page',null)} />*/}
                    <button className='btn btn-clear delete-btn' title='删除' onClick={ this.delete } />
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
