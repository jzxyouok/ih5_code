import React from 'react';
import $class from 'classnames';
import {Form, Input, InputNumber} from 'antd';
import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

const FormItem = Form.Item;

class VariableView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            minSize: false,
            nid: null,
            name: '',
            value: null,
            type: '',
        };

        this.toggle = this.toggle.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onEditChange = this.onEditChange.bind(this);
        this.endEdit = this.endEdit.bind(this);
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
        if(widget.selectVariable) {
            this.setState({
                minSize: false,
                nid: widget.selectVariable.key,
                name: widget.selectVariable.name,
                value: widget.selectVariable.value,
                type: widget.selectVariable.type
            });
        }
    }

    onEditChange(type, v) {
        if(type === 'name') {
            this.setState({
                name: v.target.value
            })
        } else if(type === 'value') {
            let value = null;
            switch(this.state.type){
                case 'number':
                    value = v;
                    break;
                case 'string':
                    value = v.target.value;
                    break;
                default:
                    break;
            }
            this.setState({
                value: value
            });
        }
    }

    endEdit(type, event) {
        if(type === 'name') {
            WidgetActions['changeVariable']({'name': event.target.value});
            WidgetActions['changeName']('var', event.target.value);
        } else if(type === 'value') {
            WidgetActions['changeVariable']({'value': event.target.value});
        }
    }

    render() {
        let valueInput = ()=>{
            let temp = null;
            switch(this.state.type){
                case 'number':
                    temp = <div className= {$class('ant-form-item-control')}>
                        <InputNumber step={0.1} size="small" placeholder="请输入值"
                               onChange={this.onEditChange.bind(this, 'value')}
                               onBlur={this.endEdit.bind(this, 'value')}
                               value={this.state.value}/></div>;
                    break;
                case 'string':
                    temp = <div className= {$class('ant-form-item-control')}>
                        <Input type="textarea" size="small" placeholder="请输入值"
                               onChange={this.onEditChange.bind(this, 'value')}
                               onBlur={this.endEdit.bind(this, 'value')}
                               value={this.state.value}/></div>;
                    break;
                default:
                    break;
            }
            return temp;
        };

        let title = ()=>{
            let temp = null;
            switch(this.state.type){
                case 'number':
                    temp = '数字';
                    break;
                case 'string':
                    temp = '文本';
                    break;
                default:
                    break;
            }
            return temp;
        };

        return <div id="VariableView"
                    className={$class('propretyView', {'keep':this.state.minSize}, {'hidden':this.props.isHidden})}
                    style={{ left : this.props.expanded? '64px':'36px'}}>
            <div id='VariableViewHeader' className="f--hlc">
                <span className="flex-1">{title()}变量</span>
                <button className='btn btn-clear' title='收起' onClick={this.toggle}/>
            </div>
            <div id='VariableViewBody' className="propretyViewBody clearfix">
                    <Form horizontal>
                        <div className={$class('f--hlc','ant-row','ant-form-item','ant-form-full')}>
                            <div className='ant-col-l ant-form-item-label'>
                                <label>名称</label>
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
                    <div className={$class('f--hlc','ant-row','ant-form-item','ant-form-full')}>
                        <div className='ant-col-l ant-form-item-label'>
                            <label>值</label>
                        </div>
                        <div className='ant-col-r'>
                            { valueInput() }
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    }
}

module.exports = VariableView;