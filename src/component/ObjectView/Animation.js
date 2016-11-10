//动效
import React from 'react';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore, {varType, isCustomizeWidget, nodeType} from '../../stores/WidgetStore';
import {checkChildClass, checkEventClass, checkNotInDomMode} from '../tempMap';
import $class from 'classnames';

const animationData = [
    {name:'数字变量', class:'var-num-btn', className:'var', disabled:false, param:{name:'', value:null, type:varType.number}},
    {name:'文本变量', class:'var-str-btn', className:'var', disabled:false, param:{name:'', value:null, type:varType.string}},
    {name:'函数', class:'func-btn', className:'func', disabled:false, param:{key:'',value:''}},
    {name:'数据库变量', class:'db-item-btn', className:'dbItem', disabled:false, param:{name:''}},
    {name:'轨迹', class:'locus-btn', className:'track', disabled:false},
    {name:'动效', class:'rotation-btn', className:'effect', disabled:false,},
    {name:'3D旋转', class:'dx-btn', className:'3dRotate', disabled:false},
    {name:'缓动', class:'easing-btn', className:'easing', disabled:false},
    {name:'物体', class:'object-btn', className:'body', disabled:false},
];

class Animation extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            data: animationData,
            canHaveEventTree: false,    //是否可有事件树
            hasEventTree: false, //是否有事件树
        };
        this.onStatusChange = this.onStatusChange.bind(this);
        this.checkAnimationEnable = this.checkAnimationEnable.bind(this);
        this.addWidgetBtn = this.addWidgetBtn.bind(this);
        this.onInitHasEventTree = this.onInitHasEventTree.bind(this);
        this.initEvent = this.initEvent.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        //是否选中图层或者舞台上的组件
        if(widget.redrawWidget) {
            this.onInitHasEventTree(widget.redrawWidget);
        }
        if(widget.redrawTree&&widget.updateTrack) {
          this.checkAnimationEnable(widget.updateTrack.parent);
        }
        if(widget.selectWidget){
            this.checkAnimationEnable(widget.selectWidget);
        } else if (widget.selectFunction) {
            this.checkAnimationEnable(widget.selectFunction);
        } else if (widget.selectVariable) {
            this.checkAnimationEnable(widget.selectVariable);
        } else if (widget.selectDBItem) {
            this.checkAnimationEnable(widget.selectDBItem);
        }
        if(widget.historyPropertiesUpdate){
            this.forceUpdate();
        }
    }

    onInitHasEventTree(selectWidget){
        let hasEventTree = false;
        let canHaveEventTree = true;
        if(!checkEventClass(selectWidget)) {
            canHaveEventTree = false;
            hasEventTree = false;
        } else if (selectWidget.props.eventTree) {
            hasEventTree = true;
        }
        this.setState({
            hasEventTree: hasEventTree,
            canHaveEventTree: canHaveEventTree
        });
    }

    initEvent(className,param) {
        this.setState({
            hasEventTree: !this.state.hasEventTree
        }, ()=>{
            WidgetActions['initEventTree'](className,param);
        });
    }

    checkAnimationEnable(widget) {
        this.onInitHasEventTree(widget);
        //过滤可选的功能组件
        let data = animationData;
        for(let i = 0; i<data.length; i++) {
            if(checkNotInDomMode(widget, data[i].className)) {
                data[i].hidden = true;
            } else {
                data[i].hidden = false;
            }
            if (checkChildClass(widget, data[i].className)) {
                data[i].disabled = false;
            } else {
                data[i].disabled = true;
                if(widget.className === 'root') {
                    data[i].hidden = true;
                }
                if(data[i].className === 'dbItem' ||
                    data[i].className === 'effect'||
                    data[i].className === '3dRotate'||
                    data[i].className === 'easing'
                ) {
                    data[i].hidden = true;
                }
            }
        }
        this.setState({
            data: data
        });
    };

    addWidgetBtn(className, param){
        if(className === 'func') {
            WidgetActions['addFadeWidget'](param, undefined, nodeType.func);
        } else if(className === 'var') {
            WidgetActions['addFadeWidget'](param, undefined, nodeType.var);
        } else if(className === 'dbItem'){
            WidgetActions['addFadeWidget'](param, undefined, nodeType.dbItem);
        } else {
            WidgetActions['addWidget'](className, param);
        }
    }

    render() {
        return (
            <div className='Animation'>
                <button className={ 'btn btn-clear btn-animation event-btn'}
                        disabled={!this.state.canHaveEventTree||this.state.hasEventTree}
                        title='事件'
                        onClick={ this.initEvent.bind(this, 'event', null) }/>
                {
                    this.state.data.map((v,i)=>{
                        return <button key={i}
                                       className={$class('btn btn-clear btn-animation ', v.class, {'hidden':v.hidden})}
                                       disabled={v.disabled}
                                       title={v.name}
                                       onClick={ this.addWidgetBtn.bind(this, v.className, v.param)} />
                    })
                }
            </div>
        );
    }
}

module.exports = Animation;