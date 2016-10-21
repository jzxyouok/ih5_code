import React from 'react';
import $class from 'classnames';
import {Form, Input, InputNumber} from 'antd';
import { Menu, Dropdown } from 'antd';
import WidgetActions from '../../actions/WidgetActions';
import WidgetStore, {nodeType, varType, nodeAction} from '../../stores/WidgetStore';
import DbHeaderStores from '../../stores/DbHeader';

const FormItem = Form.Item;
const MenuItem = Menu.Item;

const ReactDOM = require('react-dom');
const findDOMNode = ReactDOM.findDOMNode;

class DBItemView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            minSize: false,
            dbList: null, //保存当前的dblist
            dbChanged: true, //db是否有改变
            name: null,
            dbItem: null,
            fields: [],
            fieldDropdownVisibleIndex: null,
            fieldDropdownVisible: false,
            fieldFocusIndex: null,
            sourceList: []
        };

        this.toggle = this.toggle.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onEditChangeName = this.onEditChangeName.bind(this);
        this.onEndEditName = this.onEndEditName.bind(this);
        this.onSourceSelect = this.onSourceSelect.bind(this);
        this.onFieldDropdownVisibleChange = this.onFieldDropdownVisibleChange.bind(this);
        this.onStartEditField = this.onStartEditField.bind(this);
        this.onEndEditField = this.onEndEditField.bind(this);

        this.onSetFields = this.onSetFields.bind(this);
    }

    toggle(){
        this.setState({
            minSize: !this.state.minSize
        })
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
        DbHeaderStores.listen(this.DbHeaderData.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    DbHeaderData(data,bool){
        this.setState({
            dbList: data,
            dbChanged: true
        });
    }

    onStatusChange(widget) {
        if (widget.updateWidget&&widget.updateWidget.action === nodeAction.remove) {
            this.forceUpdate();
        } else if(widget.selectDBItem) {
            let dbItem = widget.selectDBItem;
            let dbId = widget.selectDBItem.widget.node.dbid;
            let dbType = widget.selectDBItem.widget.node.dbType;
            let dbList = this.state.dbList;
            if(!this.state.dbItem || this.state.dbItem.key !== widget.selectDBItem.key || this.state.dbChanged){
                let fields = [];
                if(dbType === 'personalDb'){
                    this.setState({
                        fields: [],
                    },()=>{
                        WidgetActions['ajaxSend'](null, 'POST', 'app/dbGetParm/' + dbId, null, null, function(text) {
                            var result = JSON.parse(text);
                            //console.log(result);
                            if (result['header']) {
                                let headerData = result['header'].split(",");
                                fields = this.onSetFields(dbItem, headerData);
                                this.setState({
                                    dbItem: widget.selectDBItem,
                                    name: widget.selectDBItem.name,
                                    fields: fields,
                                    dbChanged: false
                                }, ()=>{
                                    WidgetActions['changeDBItem']({'fields':fields});
                                })
                            }
                        }.bind(this));
                    })
                } else {
                    dbList.map((v)=>{
                        if(v.id === dbId){
                            let headerData = v.header.split(",");
                            let index = headerData.indexOf("null");
                            if(headerData.length !== 0 && index < 0){
                                fields = this.onSetFields(dbItem, headerData);
                            }
                        }
                    });
                    this.setState({
                        dbItem: widget.selectDBItem,
                        name: widget.selectDBItem.name,
                        fields: fields,
                        dbChanged: false
                    }, ()=>{
                        WidgetActions['changeDBItem']({'fields':fields});
                    })
                }
            } else {
                this.setState({
                    dbItem: widget.selectDBItem,
                    name: widget.selectDBItem.name,
                    fields: widget.selectDBItem.fields,
                    dbChanged: false
                })
            }
        } else if (widget.allWidgets){
            //widgetList
            let sourceList = [];
            widget.allWidgets.map((v,i)=>{
                if(v.className === 'var'||
                    v.className === 'text'||
                    v.className === 'counter'||
                    v.className === 'input' ||
                    v.className === 'bitmaptext') {
                    sourceList.push(v);
                }
            });
            this.setState({
                sourceList: sourceList
            })
        }
    }

    onSetFields(item, headers) {
        let newFields = [];
        if(item.fields.length>0) {
            headers.map((v)=>{
                let index = -1;
                item.fields.map((vItem, i)=>{
                    if(vItem.name === v) {
                        index = i;
                        newFields.push({name:v, value:vItem.value});
                    }
                });
                if (index === -1) {
                    newFields.push({name:v, value:null});
                }
            });
        } else {
            headers.map((v)=>{
                newFields.push({name:v, value:null});
            });
        }
        return newFields;
    }

    onEditChangeName(v) {
        let name = v.target.value;
        this.setState({
            name: name
        });
    }

    onEndEditName() {
        WidgetActions['changeDBItem']({'name': this.state.name});
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
        let fields = this.state.fields;
        fields[index].value = source.key;
        this.setState({
            fieldDropdownVisibleIndex: null,
            fieldDropdownVisible: false,
            fields: fields
        });
    }

    onStartEditField(index, e) {
        e.stopPropagation();
        this.setState({
            fieldFocusIndex: index,
            fieldDropdownVisibleIndex: null,
            fieldDropdownVisible: false
        }, ()=>{
            let fields = this.state.fields;
            let fieldInput = 'dbItemFiledInput'+index;
            let inputDomNode = findDOMNode(this.refs[fieldInput]).firstChild;
            let w = WidgetStore.getWidgetByKey(fields[index].value);
            inputDomNode.value = w?w.props.name:'';
            inputDomNode.focus();
        });
    }

    onEndEditField(index, e){
        let source = this.state.fields[index].value;
        if(e.target.value){
            let sourceList = this.state.sourceList;
            sourceList.forEach((v,i)=>{
                if(v.props.name === e.target.value){
                    source = v.key;
                }
            })
        }
        let fields = this.state.fields;
        fields[index].value = source;
        let w = WidgetStore.getWidgetByKey(source);
        e.target.value = w?w.props.name:'';
        this.setState({
            fieldFocusIndex: null,
            fields: fields
        }, ()=>{
            WidgetActions['changeDBItem']({'fields':fields});
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
                            return <MenuItem key={i2} source={v2}>{v2.props.name}</MenuItem>
                        })
                    }
                </Menu>
            );

            let propertyId = 'db-item-'+ i1;
            let w = WidgetStore.getWidgetByKey(v1.value);

            return <div className="item" key={i1} id={propertyId}>
                <div className="inner-item f--hcc">
                    <div className="title">
                        {
                            v1.name.substr(1)
                        }
                    </div>
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
                                            w
                                                ?  w.props.name
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
                <span className="flex-1">数据库变量属性</span>
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
                                       onChange={this.onEditChangeName.bind(this)}
                                       onBlur={this.onEndEditName.bind(this)}
                                       onPressEnter={this.onEndEditName.bind(this)}
                                       value={this.state.name}/>
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
                                 style={{width: this.state.fields.length*130+10+'px'}}>
                                    {
                                        this.state.fields.map(content)
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