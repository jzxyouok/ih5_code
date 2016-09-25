import React from 'react';
import $class from 'classnames';
import {Form, Input} from 'antd';
import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

var CodeMirror = require('codemirror/CodeMirror');

const FormItem = Form.Item;

class FunctionView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            minSize: false,
            nid: null,
            // func: null,
            key: '',
            value: ''
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
        if(widget.selectFunction) {
            this.setState({
                nid: widget.selectFunction.keyId,
                // func: widget.selectFunction,
                key: widget.selectFunction.key,
                value: widget.selectFunction.value
            });
        }
    }

    onEditChange(type, v) {
        if(type === 'key') {
            this.setState({
                key: v.target.value
            })
        } else if(type === 'value') {
            this.setState({
                value: v
            })
        }
    }

    endEdit(type, v) {
        if(type === 'key') {
            WidgetActions['changeFunction']({'key': this.state.key});
        } else if(type === 'value') {
            if(v === false){
                WidgetActions['changeFunction']({'value': this.state.value});
            }
        }
    }

    render() {
        return <div id="FunctionView"
                    className={$class({'keep':this.state.minSize}, {'hidden':this.props.isHidden})}
                    style={{ left : this.props.expanded? '65px':'37px'}}>
            <div id='FunctionViewHeader' className="f--hlc">
                <span className="flex-1">函数</span>
                <button className='btn btn-clear' title='收起' onClick={this.toggle}/>
            </div>
            <div id='FunctionViewBody' className="clearfix">
                <div className="function-body-layer">
                    <Form>
                        <FormItem label="名称">
                            <Input type="text" size="large" placeholder="请输入名称"
                                   onChange={this.onEditChange.bind(this, 'key')}
                                   onBlur={this.endEdit.bind(this, 'key')}
                                   value={this.state.key}/>
                        </FormItem>
                        <FormItem label="函数体" className="function-body">
                            <CodeMirror options={{'lineNumbers': true}}
                                        onChange={this.onEditChange.bind(this, 'value')}
                                        onFocusChange={this.endEdit.bind(this, 'value')}
                                        value={this.state.value} />
                        </FormItem>
                    </Form>
                </div>
            </div>
        </div>
    }
}

module.exports = FunctionView;