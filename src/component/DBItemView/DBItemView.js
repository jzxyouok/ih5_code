import React from 'react';
import $class from 'classnames';
import {Form, Input, InputNumber} from 'antd';
import WidgetActions from '../../actions/WidgetActions';
import WidgetStore, {nodeType, varType} from '../../stores/WidgetStore';

const FormItem = Form.Item;

class DBItemView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            minSize: false,
            itemId: null,
            itemList: [{name:'1', value:'啦啦啦'},
                {name:'2', value:'啦啦啦'},
                {name:'3', value:'啦啦啦'},
                {name:'4', value:'啦啦啦'},
                {name:'5', value:'啦啦啦'}],
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

    }

    onEditChange(v) {

    }

    endEdit(event) {

    }

    render() {
        let content = (v1, i1)=>{
            return <div className="item" key={i1}>
                <div className="inner-item title">
                    {v1.name}
                </div>
                <div className="inner-item value">
                    <div className="drop-down">
                        {v1.value}
                    </div>
                </div>

                </div>;
        };

        return <div id="DBItemView"
                    className={$class('propertyView', {'keep':this.state.minSize}, {'hidden':this.props.isHidden})}
                    style={{ left : this.props.expanded? '64px':'37px'}}>
            <div id='DBItemViewHeader' className="f--hlc">
                <span className="flex-1">属性</span>
                <button className='btn btn-clear' title='收起' onClick={this.toggle}/>
            </div>
            <div id='DBItemViewBody' className="propertyViewBody clearfix">
                <Form horizontal>
                    <div className={$class('f--hlc','ant-row','ant-form-item','ant-form-full', 'db-item-id')}>
                        <div className='ant-col-l ant-form-item-label'>
                            <label>ID</label>
                        </div>
                        <div className='ant-col-r'>
                            <div className= {$class('ant-form-item-control')}>
                                <Input type="text" placeholder="请输入ID"
                                       onChange={this.onEditChange.bind(this)}
                                       onBlur={this.endEdit.bind(this)}
                                       value={this.state.itemId}/>
                            </div>
                        </div>
                    </div>
                </Form>
                <Form horizontal>
                    <div className={$class('f--hlc','ant-row','ant-form-item','ant-form-full', 'db-item-id')}>
                        <div className='ant-col-l ant-form-item-label'>
                            <label>字段</label>
                        </div>
                        <div className='ant-col-r'>
                            <div className="container-scroll">
                                <div className={$class("item-container")}
                                style={{width: this.state.itemList.length*130+10+'px'}}>
                                    {
                                        this.state.itemList.map(content)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    }
}

module.exports = DBItemView;