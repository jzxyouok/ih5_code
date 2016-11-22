//添加／编辑小模块
import React from 'react';
import $class from 'classnames';

import {Form, Input, InputNumber} from 'antd';
import { Menu, Dropdown } from 'antd';
import { SelectTargetButton } from '../PropertyView/SelectTargetButton';
import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';
import { getPropertyMap, propertyType} from '../PropertyMap'

const MenuItem = Menu.Item;

const typeMap = {
    props: '属性',
    events: '事件',
    funcs: '动作'
};

class EditBlock extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            minSize: false,
            blockId: null,
            name: '',
            props: [{name: null, objKey:null, detail:null}],
            events: [{name: null, objKey: null, detail: null}],
            funcs: [{name: null, objKey: null, detail: null}],
            selectWidget: null,
            objectList: []
        };

        this.onStatusChange = this.onStatusChange.bind(this);

        this.toggle = this.toggle.bind(this);
        this.saveBlock = this.saveBlock.bind(this);
        this.saveAsNewBlock = this.saveAsNewBlock.bind(this);
        this.cancel = this.cancel.bind(this);

        this.onChangeBlockName = this.onChangeBlockName.bind(this);

        this.getAllObjects = this.getAllObjects.bind(this);
        this.onObjectSelect = this.onObjectSelect.bind(this);

        this.getParamsDetailList = this.getParamsDetailList.bind(this);
        this.onDetailSelect = this.onDetailSelect.bind(this);

        this.onAddParamsBtn = this.onAddParamsBtn.bind(this);
        this.onEditParamsName = this.onEditParamsName.bind(this);
        this.onRemoveParamsBtn = this.onRemoveParamsBtn.bind(this);

        this.onPropsObjButtonClick = this.onPropsObjButtonClick.bind(this);
        this.onPropsObjResultGet = this.onPropsObjResultGet.bind(this);

        this.setObjectKey = this.setObjectKey.bind(this);

        this.getParamList = this.getParamList.bind(this);
        this.setParamListState = this.setParamListState.bind(this);
    }

    toggle(){
        this.setState({
            minSize: !this.state.minSize
        })
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if(widget.selectWidget) {
            let props = [{name: null, objKey:null, detail:null}];
            let events = [{name: null, objKey: null, detail: null}];
            let funcs = [{name: null, objKey: null, detail: null}];
            let name = '';
            if(widget.selectWidget.props&&widget.selectWidget.props.block) {
                let block = JSON.parse(JSON.stringify(widget.selectWidget.props.block));
                props = block.mapping.props;
                events = block.mapping.events;
                funcs = block.mapping.funcs;
                name = block.name;
            }
            //获取对象列表
            this.setState({
                selectWidget : widget.selectWidget,
                objectList: this.getAllObjects(widget.selectWidget),
                props: props,
                events: events,
                funcs: funcs,
                name: name,
            });
        } else if (widget.allWidgets) {
            this.setState({
                objectList: this.getAllObjects(this.state.selectWidget)
            })
        }
    }

    getParamList(type) {
        let list = [];
        switch(type){
            case 'props':
                list = this.state.props;
                break;
            case 'events':
                list = this.state.events;
                break;
            case 'funcs':
                list = this.state.funcs;
                break;
        }
        return list;
    }

    setParamListState(type, list) {
        switch(type){
            case 'props':
                this.setState({
                    props: list
                });
                break;
            case 'events':
                this.setState({
                    events: list
                });
                break;
            case 'funcs':
                this.setState({
                    funcs: list
                });
                break;
        }
    }

    onChangeBlockName(e) {
        let value = e.target.value;
        this.setState({
            name: value
        })
    }

    getAllObjects(widget) {
        let objectList = [];
        if(widget) {
            objectList.push(widget);
            //递归遍历添加有事件widget到eventTreeList
            let loopWidgetTree = (children) => {
                children.forEach(ch=>{
                    objectList.push(ch);
                    if (ch.children && ch.children.length > 0) {
                        loopWidgetTree(ch.children);
                    }
                });
            };
            loopWidgetTree(widget.children);
        }
        return objectList;
    }

    setObjectKey(index,type,key) {
        let list = this.getParamList(type);
        list[index].objKey = key;
        list[index].detail = null;
        this.setParamListState(type,list);
    }

    onObjectSelect(index, type, e) {
        e.domEvent.stopPropagation();
        let key = e.item.props.obj.key;
        this.setObjectKey(index,type,key);
    }

    getParamsDetailList(obj,type) {
        let list = [];
        getPropertyMap(obj, obj.className, type).map((item) => {
            let temp = JSON.parse(JSON.stringify(item));
            list.push(temp);
        });
        return list;
    }

    onDetailSelect(index, type, e) {
        e.domEvent.stopPropagation();
        let detail = e.item.props.detail;
        let list = this.getParamList(type);
        list[index].detail = detail;
        this.setParamListState(type,list);
    }

    onAddParamsBtn(type, e) {
        let list = this.getParamList(type);
        list.push({name: null, objKey:null, detail:null});
        this.setParamListState(type,list);
    }

    onEditParamsName(index, type, e) {
        let value = e.target.value;
        let list = this.getParamList(type);
        list[index].name = value;
        this.setParamListState(type,list);
    }

    onRemoveParamsBtn(index, type, e) {
        let list = this.getParamList(type);
        if(list.length === 1) {
            list=[{name: null, objKey:null, detail:null}];
        } else {
            list.splice(index,1);
        }
        this.setParamListState(type,list);
    }

    onPropsObjButtonClick() {
        return true;
    }

    onPropsObjResultGet(index, type, result){
        let getTarget = false;
        this.state.objectList.forEach((v)=>{
            if(result.key === v.key){
                getTarget = true;
            }
        });
        if (getTarget||result.key===null) {
            this.setObjectKey(index,type,result.key);
        };
    }

    saveBlock() {
        WidgetActions['addOrEditBlock'](
            {
                name:this.state.name,
                mapping:{
                    props:this.state.props,
                    events:this.state.events,
                    funcs:this.state.funcs
                }
            });
    }

    saveAsNewBlock() {

    }

    cancel() {
        WidgetActions['activeBlockMode'](false);
    }

    render() {
        let objItem = (v,i)=>{
            return  <MenuItem key={i} obj={v}>{v.props.name}</MenuItem>
        };

        let detailItem = (v,i)=>{
            return  <MenuItem key={i} detail={v}>{v.showName}</MenuItem>
        };

        let objMenu = (i1, type)=>{
            return (<Menu onClick={this.onObjectSelect.bind(this, i1, type)}>
                {
                    !this.state.objectList||this.state.objectList.length==0
                        ? null
                        : this.state.objectList.map(objItem)
                }
            </Menu>)
        };

        let detailMenu = ((obj, index, type) => {
            //根据obj的class去找它的函数，属性，对象
            let list = this.getParamsDetailList(obj, type);
            return (<Menu onClick={this.onDetailSelect.bind(this, index, type)}>
                {
                    !list||list.length==0
                        ? null
                        : list.map(detailItem)
                }
            </Menu>);
        });

        let params = (v1,i1,type)=>{
            let typeName = typeMap[type];
            let propertyId = type+'-params-item-'+i1;
            let paramObj = null;
            if(v1&&v1.objKey) {
                paramObj = WidgetStore.getWidgetByKey(v1.objKey);
            }
            //设置通用参数
            return <div className={$class('ant-row','ant-form-item','ant-form-full', 'params-item')} id={propertyId} key={i1}>
                <div className='ant-col-r'>
                    <div className="right-col-container f--hlc">
                        <div className='ant-form-item-label'>
                            <label>名称</label>
                        </div>
                        <div className= {$class('ant-form-item-control params-name' )}>
                            <Input type="text" size="small" placeholder={'请输入'+typeName+'名称'}
                                onChange={this.onEditParamsName.bind(this,i1,type)}
                                value={v1.name}/>
                        </div>
                        <div className='ant-form-item-label ant-form-item-label-mapping'>
                            <label>{typeName}关联</label>
                        </div>
                        <div className= {$class('ant-form-item-control params-dropdown')}>
                            {
                                !paramObj
                                    ? (<Dropdown overlay={objMenu(i1,type)} trigger={['click']}
                                                 getPopupContainer={() => document.getElementById('edit-block-body-layer')}>
                                        <div className={$class("dropDown-div")}>
                                            <div className="f--hlc option-select-title">
                                                <SelectTargetButton className={'obj-select'}
                                                                disabled={false}
                                                                targetList={this.state.objectList}
                                                                onClick={this.onPropsObjButtonClick.bind(this, i1, type)}
                                                                getResult={this.onPropsObjResultGet.bind(this, i1, type)} />
                                                <div className="title-name">选择对象</div>
                                                <span className="icon" />
                                            </div>
                                        </div>
                                        </Dropdown>)
                                    : <div className="title-group f--hlc">
                                        <SelectTargetButton className={'obj-select'}
                                                        disabled={false}
                                                        targetList={this.state.objectList}
                                                        onClick={this.onPropsObjButtonClick.bind(this, i1, type)}
                                                        getResult={this.onPropsObjResultGet.bind(this, i1, type)} />
                                        <div className="title-obj">{paramObj.props.name}</div>
                                        <div className="title-dot"></div>
                                        {
                                            v1.detail
                                                ? <div className="title-detail">{v1.detail.showName}</div>
                                                : <Dropdown overlay={detailMenu(paramObj,i1,type)} trigger={['click']}
                                                        getPopupContainer={() => document.getElementById('edit-block-body-layer')}>
                                                    <div className={$class("detail-dropDown-div")}>
                                                        <div className="f--hlc option-select-title">
                                                            选择{typeName}
                                                            <span className="icon" />
                                                        </div>
                                                    </div>
                                                </Dropdown>
                                        }
                                        </div>
                            }
                        </div>
                        <div className= {$class('ant-form-item-control params-delete')} onClick={this.onRemoveParamsBtn.bind(this, i1, type)}>
                        </div>
                    </div>
                </div>
            </div>
        };

        let getParams = (list, type)=>{
            let paramList = [];
            list.forEach((v,i)=>{
                paramList.push(params(v,i,type));
            });
            return paramList;
        };

        return <div id="EditBlockView"
                    className={$class('propertyView', {'keep':this.state.minSize}, {'hidden':this.props.isHidden})}
                    style={{ left : this.props.expanded? '64px':'37px'}}>
            <div id='EditBlockViewHeader' className="f--hlc">
                <span className="flex-1">自定义小模块</span>
                <button className='btn btn-clear' title='收起' onClick={this.toggle}/>
            </div>
            <div id='EditBlockViewBody' className={$class({'hidden':this.state.minSize})}>
                <div id='edit-block-body-layer' className={$class("edit-block-body-layer",{'hidden':this.state.minSize})}>
                    <Form horizontal>
                        <div className={$class('f--hlc','ant-row','ant-form-item','ant-form-full')}>
                            <div className='ant-col-l ant-form-item-label'>
                                <label>名称</label>
                            </div>
                            <div className='ant-col-r'>
                                <div className= {$class('ant-form-item-control')}>
                                    <Input type="text" size="small" placeholder="请输入模块名称"
                                           className="item-name"
                                           onChange={this.onChangeBlockName}
                                           value={this.state.name}/>
                                </div>
                            </div>
                        </div>
                    </Form>
                    <Form horizontal className="customize-params-form">
                        <div className="params-title">自定义属性</div>
                        {
                            !this.state.props||this.state.props.length==0
                                ? null
                                : getParams(this.state.props,'props')
                        }
                        <div className="add-btn" onClick={this.onAddParamsBtn.bind(this, 'props')}>
                            <div className="btn-layer">
                                <span className="heng"></span>
                                <span className="shu"></span>
                            </div>
                        </div>
                    </Form>
                    <Form horizontal className="customize-params-form">
                        <div className="params-title">自定义事件</div>
                        {
                            !this.state.events||this.state.events.length==0
                                ? null
                                : getParams(this.state.events,'events')
                        }
                        <div className="add-btn" onClick={this.onAddParamsBtn.bind(this, 'events')}>
                            <div className="btn-layer">
                                <span className="heng"></span>
                                <span className="shu"></span>
                            </div>
                        </div>
                    </Form>
                    <Form horizontal className="customize-params-form">
                        <div className="params-title">自定义动作</div>
                        {
                            !this.state.funcs||this.state.funcs.length==0
                                ? null
                                : getParams(this.state.funcs,'funcs')
                        }
                        <div className="add-btn" onClick={this.onAddParamsBtn.bind(this, 'funcs')}>
                            <div className="btn-layer">
                                <span className="heng"></span>
                                <span className="shu"></span>
                            </div>
                        </div>
                    </Form>
                    <div className="action-part f--hcc">
                        <button className="action-btn" onClick={this.saveBlock}>保存</button>
                        <button className="action-btn" onClick={this.saveAsNewBlock}>另存为</button>
                        <button className="action-btn cancel-btn" onClick={this.cancel}>取消</button>
                    </div>
                </div>
            </div>
        </div>
    }
}

module.exports = EditBlock;