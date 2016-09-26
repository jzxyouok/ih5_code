import React from 'react';
import $class from 'classnames';
import {Form, Input} from 'antd';
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
            value: '',
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
            this.setState({
                value: v.target.value
            })
        } else if(type === 'type') {
            this.setState({
                type: v.target.value
            })
        }
    }

    endEdit(type, v) {
        if(type === 'name') {
            WidgetActions['changeVariable']({'name': this.state.name});
        } else if(type === 'value') {
            if(v === false){
                WidgetActions['changeVariable']({'value': this.state.value});
            }
        } else if(type === 'type') {
            if(v === false){
                WidgetActions['changeVariable']({'type': this.state.value});
            }
        }
    }

    render() {
        return <div id="VariableView"
                    className={$class({'keep':this.state.minSize}, {'hidden':this.props.isHidden})}
                    style={{ left : this.props.expanded? '65px':'37px'}}>
            <div id='VariableViewHeader' className="f--hlc">
                <span className="flex-1">变量</span>
                <button className='btn btn-clear' title='收起' onClick={this.toggle}/>
            </div>
            <div id='VariableViewBody' className="clearfix">
                <div className="variable-body-layer">
                    <Form>
                        <FormItem label="名称">
                            <Input type="text" size="large" placeholder="请输入名称"
                                   onChange={this.onEditChange.bind(this, 'name')}
                                   onBlur={this.endEdit.bind(this, 'name')}
                                   value={this.state.name}/>
                        </FormItem>
                        <FormItem label="类别">
                        </FormItem>
                        <FormItem label="值">
                        </FormItem>
                    </Form>
                </div>
            </div>
        </div>
    }
}

module.exports = VariableView;