import React from 'react';
import $class from 'classnames';
import {Form, Input} from 'antd';
const FormItem = Form.Item;

class FunctionView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            minSize: false,
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle(){
        this.setState({
            minSize: !this.state.minSize
        })
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
                            <Input type="text" size="large" placeholder="请输入名称" />
                        </FormItem>
                        <FormItem label="函数体" className="function-body">
                            <div className="line-number clearfix">
                                <textarea disabled value={'123456789'}></textarea>
                            </div>
                            <Input type="textarea" autosize={false}/>
                        </FormItem>
                    </Form>
                </div>
            </div>
        </div>
    }
}

module.exports = FunctionView;