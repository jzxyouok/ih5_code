import React from 'react';
import $class from 'classnames';
import {Form, Input, InputNumber} from 'antd';
import { Menu, Dropdown } from 'antd';
import WidgetActions from '../../actions/WidgetActions';
import WidgetStore, {nodeType, varType} from '../../stores/WidgetStore';

const FormItem = Form.Item;
const MenuItem = Menu.Item;

const ReactDOM = require('react-dom');
const findDOMNode = ReactDOM.findDOMNode;

class DBItemView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            minSize: false,
            itemId: null,
            fieldDropdownVisibleIndex: null,
            fieldDropdownVisible: false,
            fieldFocusIndex: null,
            itemList: [{name:'姓名', value:null},
                {name:'手机', value:null},
                {name:'type', value:null},
                {name:'name', value:null},
                {name:'email', value:null}],
            sourceList: [{name:'src1'},{name:'src2'},{name:'src3'}]
        };

        this.toggle = this.toggle.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onEditChange = this.onEditChange.bind(this);
        this.endEdit = this.endEdit.bind(this);
        this.onSourceSelect = this.onSourceSelect.bind(this);
        this.onFieldDropdownVisibleChange = this.onFieldDropdownVisibleChange.bind(this);
        this.onStartEditField = this.onStartEditField.bind(this);
        this.onEndEditField = this.onEndEditField.bind(this);
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

    onFieldDropdownVisibleChange(index, visible){
        let cVisible = this.state.fieldFocusIndex!=null?false:visible;
        let i = visible?index:null;
        this.setState({
            fieldDropdownVisibleIndex: i,
            fieldDropdownVisible: cVisible
        })
    }

    onSourceSelect(index, e){
        e.domEvent.stopPropagation();
        let source = e.item.props.source;
        let itemList = this.state.itemList;
        itemList[index].value = source;
        this.setState({
            fieldDropdownVisibleIndex: null,
            fieldDropdownVisible: false,
            itemList: itemList
        });
    }

    onStartEditField(index, e) {
        e.stopPropagation();
        this.setState({
            fieldFocusIndex: index,
            fieldDropdownVisibleIndex: null,
            fieldDropdownVisible: false
        }, ()=>{
            let itemList = this.state.itemList;
            let fieldInput = 'dbItemFiledInput'+index;
            let inputDomNode = findDOMNode(this.refs[fieldInput]).firstChild;
            inputDomNode.value = itemList[index].value?itemList[index].value.name:'';
            inputDomNode.focus();
        });
    }

    onEndEditField(index, e){
        let source = this.state.itemList[index].value;
        if(e.target.value){
            let sourceList = this.state.sourceList;
            sourceList.forEach((v,i)=>{
                if(v.name === e.target.value){
                    source = v;
                }
            })
        }
        let itemList = this.state.itemList;
        itemList[index].value = source;
        e.target.value = itemList[index].value?itemList[index].value.name:'';
        this.setState({
            fieldFocusIndex: null,
            itemList: itemList
        });
    }

    render() {
        let content = (v1, i1)=>{
            let sourceMenu = (
                <Menu onClick={this.onSourceSelect.bind(this, i1)}>
                    {
                        !this.state.sourceList||this.state.sourceList.length==0
                            ? null
                            : this.state.sourceList.map((v2, i2)=>{
                            return <MenuItem key={i2} source={v2}>{v2.name}</MenuItem>
                        })
                    }
                </Menu>
            );

            let propertyId = 'db-item-'+ i1;

            return <div className="item" key={i1} id={propertyId}>
                <div className="inner-item f--hcc">
                    <div className="title">{v1.name}</div>
                </div>
                <div className="inner-item value">
                    <div className="drop-down f--slc">
                        <Dropdown overlay={sourceMenu} trigger={['click']}
                                  getPopupContainer={() => document.getElementById('DBItemViewBody')}
                                  visible={this.state.fieldDropdownVisible&&this.state.fieldDropdownVisibleIndex === i1}
                                  onVisibleChange={this.onFieldDropdownVisibleChange.bind(this, i1)}>
                            <div className={$class('dropDown-div',
                                {'active':this.state.fieldDropdownVisible&&this.state.fieldDropdownVisibleIndex === i1},
                                {'on-focus':this.state.fieldFocusIndex === i1})}>
                                <div className= {$class('ant-form-item-control')}>
                                    <div onClick={this.onStartEditField.bind(this, i1)} className={$class('ant-input ant-input-sm ant-fade-input',
                                        {'hidden':this.state.fieldFocusIndex!=null&&this.state.fieldFocusIndex==i1})}>
                                        {
                                            v1.value
                                                ? v1.value.name
                                                : '数据来源'
                                        }
                                    </div>
                                    <Input type="text" size="small" placeholder="数据来源"
                                           ref={'dbItemFiledInput'+i1}
                                           className={$class({'hidden':!(this.state.fieldFocusIndex!=null&&this.state.fieldFocusIndex==i1)})}
                                           onBlur={this.onEndEditField.bind(this, i1)}
                                           onPressEnter={this.onEndEditField.bind(this, i1)}/>
                                </div>
                                <span className="icon" />
                            </div>
                        </Dropdown>
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
                                <Input type="text" size="small" placeholder="请输入ID"
                                       onChange={this.onEditChange.bind(this)}
                                       onBlur={this.endEdit.bind(this)}
                                       value={this.state.itemId}/>
                            </div>
                        </div>
                    </div>
                </Form>
                <Form horizontal>
                    <div className={$class('f--hlc','ant-row','ant-form-item','ant-form-full')}>
                        <div className='ant-col-l ant-form-item-label'>
                            <label>字段</label>
                        </div>
                        <div className='ant-col-r'>
                            <div className="container-scroll" id="db-item-container-scroll">
                                <div className={$class('item-container')}
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