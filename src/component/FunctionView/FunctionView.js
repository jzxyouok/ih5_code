import React from 'react';
import $class from 'classnames';
import {Form, Input} from 'antd';
import { Menu, Dropdown } from 'antd';
import WidgetActions from '../../actions/WidgetActions';
import WidgetStore, {nodeType} from '../../stores/WidgetStore';
import { propertyType } from '../PropertyMap'

var CodeMirror = require('codemirror/CodeMirror');

const FormItem = Form.Item;
const MenuItem = Menu.Item;

const paramTypes = [
    {name: 'Number', type: propertyType.Number, showName: '数字'},
    {name: 'String', type: propertyType.String, showName: '字符'}
];

class FunctionView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            minSize: false,
            nid: null,
            name: '',
            value: '',
            params: null,
            paramVisibleIndex: null
        };

        this.toggle = this.toggle.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onEditChange = this.onEditChange.bind(this);
        this.endEdit = this.endEdit.bind(this);
        this.onAddParamsBtn = this.onAddParamsBtn.bind(this);
        this.onParamsTypeVisibleChange = this.onParamsTypeVisibleChange.bind(this);
        this.onEditParamsChange = this.onEditParamsChange.bind(this);
        this.endEditParams = this.endEditParams.bind(this);
        this.onRemoveParamsBtn = this.onRemoveParamsBtn.bind(this);
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
        if(widget.selectFunction) {
            this.setState({
                minSize: false,
                nid: widget.selectFunction.key,
                name: widget.selectFunction.name,
                value: widget.selectFunction.value,
                params: widget.selectFunction.params,
            });
        }
    }

    onParamsTypeVisibleChange(index, visible) {
        let i = visible?index:null;
        this.setState({
            paramVisibleIndex: i
        })
    }

    onParamsTypeSelect(index, e) {
        e.domEvent.stopPropagation();
        let paramType = e.item.props.paramType;
        let params = this.state.params;
        params[index].type = paramType;
        this.setState({
            paramVisibleIndex: null,
            params: params
        }, ()=>{
            WidgetActions['changeFunction']({'params': this.state.params});
        });
    }

    onEditParamsChange(index, e) {
        let name = e.target.value;
        let params = this.state.params;
        params[index].name = name;
        this.setState({
            params: params
        })
    }

    endEditParams() {
        WidgetActions['changeFunction']({'params': this.state.params});
    }

    onRemoveParamsBtn(index) {
        let params = this.state.params;
        if(params.length===1){
            params = [{type:null, name:null}];
        } else {
            params.splice(index, 1);
        }
        this.setState({
            params: params
        }, ()=>{
            WidgetActions['changeFunction']({'params': this.state.params});
        });
    }

    onAddParamsBtn() {
        let params = this.state.params;
        params.push({type:null, name:''});
        this.setState({
            params: params
        }, ()=>{
            WidgetActions['changeFunction']({'params': this.state.params});
        });
    }

    onEditChange(type, v) {
        if(type === 'name') {
            this.setState({
                name: v.target.value
            })
        } else if(type === 'value') {
            this.setState({
                value: v
            })
        }
    }

    endEdit(type, v) {
        if(type === 'name') {
            WidgetActions['changeFunction']({'name': this.state.name});
            WidgetActions['renameTreeNode'](nodeType.func, this.state.name, false);
        } else if(type === 'value') {
            if(v === false){
                WidgetActions['changeFunction']({'value': this.state.value});
            }
        }
    }

    render() {
        let params = (v1,i1)=>{

            let typeItem = (v,i)=>{
                return  <MenuItem key={i} paramType={v}>{v.showName}</MenuItem>
            };

            let typeMenu = (
                <Menu onClick={this.onParamsTypeSelect.bind(this, i1)}>
                    {
                        !paramTypes||paramTypes.length==0
                            ? null
                            : paramTypes.map(typeItem)
                    }
                </Menu>
            );
            let propertyId = 'func-params-item-'+ i1;

            //设置通用参数
            return <div className={$class('f--hlc','ant-row','ant-form-item','ant-form-full', 'params-item')} id={propertyId} key={i1}>
                <div className='ant-col-l ant-form-item-label'>
                    <label>参数{i1+1}</label>
                </div>
                <div className='ant-col-r'>
                    <div className="right-col-container">
                        <div className='ant-form-item-label'>
                            <label>名称</label>
                        </div>
                        <div className= {$class('ant-form-item-control params-name' )}>
                            <Input type="text" size="small" placeholder="输入名称"
                                   onChange={this.onEditParamsChange.bind(this, i1)}
                                   onBlur={this.endEditParams}
                                   value={this.state.params[i1].name}/>
                        </div>
                        <div className='ant-form-item-label'>
                            <label>类型</label>
                        </div>
                        <div className= {$class('ant-form-item-control params-dropdown')}>
                            <Dropdown overlay={typeMenu} trigger={['click']}
                                      getPopupContainer={() => document.getElementById('function-body-layer')}
                                      onVisibleChange={this.onParamsTypeVisibleChange.bind(this, i1)}>
                                <div className={$class("dropDown-div", {'active':this.state.paramVisibleIndex === i1})}>
                                    <div className="title f--hlc">
                                        { !this.state.params[i1] ||
                                        !this.state.params[i1].type
                                            ?'选择参数类型'
                                            :this.state.params[i1].type.showName
                                        }
                                        <span className="icon" />
                                    </div>
                                </div>
                            </Dropdown>
                        </div>
                        <div className= {$class('ant-form-item-control params-delete')} onClick={this.onRemoveParamsBtn.bind(this, i1)}>
                        </div>
                    </div>
                </div>
            </div>
        };

        return <div id="FuncView"
                    className={$class('propertyView',{'keep':this.state.minSize}, {'hidden':this.props.isHidden})}
                    style={{ left : this.props.expanded? '65px':'37px', display: 'inherit'}}>
            <div id='FunctionViewHeader' className="f--hlc">
                <span className="flex-1">函数</span>
                <button className='btn btn-clear' title='收起' onClick={this.toggle}/>
            </div>
            <div id='FunctionViewBody' className="propertyViewBody clearfix">
                <div id='function-body-layer' className={$class("function-body-layer",{'hidden':this.state.minSize})}>
                    <Form horizontal>
                        <div className={$class('f--hlc','ant-row','ant-form-item','ant-form-full')}>
                            <div className='ant-col-l ant-form-item-label'>
                                <label>函数名称</label>
                            </div>
                            <div className='ant-col-r'>
                                <div className= {$class('ant-form-item-control')}>
                                    <Input type="text" size="small" placeholder="请输入名称"
                                           onChange={this.onEditChange.bind(this, 'name')}
                                           onBlur={this.endEdit.bind(this, 'name')}
                                           value={this.state.name}/>
                                </div>
                            </div>
                        </div>
                    </Form>
                    <Form horizontal>
                        {
                            !this.state.params||this.state.params.length==0
                                ? null
                                : this.state.params.map(params)
                        }
                        <div className="add-btn" onClick={this.onAddParamsBtn}>
                            <div className="btn-layer">
                                <span className="heng"></span>
                                <span className="shu"></span>
                            </div>
                        </div>
                    </Form>



                    {/*<Form horizontal>*/}
                        {/*<div className={$class('f--hlc','ant-row','ant-form-item','ant-form-full')}>*/}
                            {/*<div className='ant-col-l ant-form-item-label'>*/}
                                {/*<label>返回值</label>*/}
                            {/*</div>*/}
                            {/*<div className='ant-col-r'>*/}
                                {/*<div className= {$class('ant-form-item-control')}>*/}
                                    {/*<Input type="text" size="small" placeholder="选择返回值"*/}
                                           {/*onChange={this.onEditChange.bind(this, 'name')}*/}
                                           {/*onBlur={this.endEdit.bind(this, 'name')}*/}
                                           {/*value={this.state.name}/>*/}
                                {/*</div>*/}
                            {/*</div>*/}
                        {/*</div>*/}
                    {/*</Form>*/}

                    <Form horizontal>
                        <div className={$class('f--hlc','ant-row','ant-form-item','ant-form-full')}>
                            <div className='ant-col-l ant-form-item-label'>
                                <label>函数体</label>
                            </div>
                            <div className='ant-col-r function-body'>
                                <div className= {$class('ant-form-item-control')}>
                                    <CodeMirror options={{'lineNumbers': true}}
                                                onChange={this.onEditChange.bind(this, 'value')}
                                                onFocusChange={this.endEdit.bind(this, 'value')}
                                                nid={this.state.nid}
                                                value={this.state.value} />
                                </div>
                            </div>
                        </div>
                    </Form>
                </div>
                {/*<div className={$class("function-body-layer",{'hidden':this.state.minSize})}>*/}
                    {/*<Form>*/}
                        {/*<FormItem label="名称">*/}
                            {/*<Input type="text" size="large" placeholder="请输入名称"*/}
                                   {/*onChange={this.onEditChange.bind(this, 'name')}*/}
                                   {/*onBlur={this.endEdit.bind(this, 'name')}*/}
                                   {/*value={this.state.name}/>*/}
                        {/*</FormItem>*/}
                        {/*<FormItem label="函数体" className="function-body">*/}
                            {/*<CodeMirror options={{'lineNumbers': true}}*/}
                                        {/*onChange={this.onEditChange.bind(this, 'value')}*/}
                                        {/*onFocusChange={this.endEdit.bind(this, 'value')}*/}
                                        {/*nid={this.state.nid}*/}
                                        {/*value={this.state.value} />*/}
                        {/*</FormItem>*/}
                    {/*</Form>*/}
                {/*</div>*/}
            </div>
        </div>
    }
}

module.exports = FunctionView;