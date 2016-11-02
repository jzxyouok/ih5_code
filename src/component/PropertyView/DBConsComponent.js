import React from 'react';
import $class from 'classnames';
import { Dropdown, Menu } from 'antd';
import { FormulaInput } from '../PropertyView/FormulaInputComponent';
import WidgetActions from '../../actions/WidgetActions';

const MenuItem = Menu.Item;

class DBConsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fieldList: [],
            value: props.value || [{field:null,operation:'=',compare:null}]
        };
        this.operationList = ['=', '>', '<', '!=', '≥', '≤'];
        this.onGetDBFields = this.onGetDBFields.bind(this);
        this.onMenuSelect = this.onMenuSelect.bind(this);
        this.onRemoveCon = this.onRemoveCon.bind(this);
        this.onAddCon = this.onAddCon.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value || [{field:null,operation:'=',compare:null}]
        });
    }

    onGetDBFields(e) {
        if(this.props.obj) {
            let obj = this.props.obj;
            WidgetActions['ajaxSend'](null, 'POST', 'app/dbGetParm/' + obj.props.dbid, null, null, function(text) {
                var result = JSON.parse(text);
                let fieldList = [];
                if (result['header']) {
                    let headerData = result['header'].split(",");
                    fieldList = headerData;
                }
                this.setState({
                    fieldList : fieldList
                })
            }.bind(this));
        } else {
            this.setState({
                fieldList : []
            })
        }
    }

    onMenuSelect(item, index, type, e) {
        let data = null;
        let value = this.state.value;
        switch (type) {
            case 'field':
                data = e.item.props.data;
                item.field = data;
                break;
            case 'operation':
                data = e.item.props.data;
                item.operation = data;
                break;
            case 'obj':
                data = e;
                item.compare = data;
                break;
        }
        value[index] = item;
        this.setState({
            value: value
        }, ()=>{
            this.props.onChange(this.state.value);
        })
    }

    onRemoveCon(item, index, e) {
        e.stopPropagation();
        let value = this.state.value;
        if(value.length === 1) {
            value = [];
            value.push({field:null,operation:'=',compare:null});
        } else {
            value.splice(index, 1);
        }
        this.setState({
            value: value
        }, ()=>{
            this.props.onChange(this.state.value);
        })
    }

    onAddCon(e) {
        e.stopPropagation();
        let value = this.state.value;
        value.push({field:null,operation:'=',compare:null});
        this.setState({
            value: value
        }, ()=>{
            this.props.onChange(this.state.value);
        })
    }

    render () {
        let menu = (value, index)=> {
            return (<Menu onClick={this.onMenuSelect.bind(this, value, index,'field')}>
                {
                    !this.state.fieldList||this.state.fieldList.length==0
                        ? null
                        : this.state.fieldList.map((v, i)=>{
                        return <MenuItem data={v} key={i}>{v.substr(1)}</MenuItem>;
                    })
                }
            </Menu>);
        };

        let operation = (value, index)=> {
            return (<Menu onClick={this.onMenuSelect.bind(this, value, index,'operation')}>
                {
                    !this.operationList||this.operationList.length==0
                        ? null
                        : this.operationList.map((v, i)=>{
                        return <MenuItem data={v} key={i}>{v}</MenuItem>;
                    })
                }
            </Menu>);
        };

        let con = (v, i)=> {
            return (
                <div className="condition-wrap f--hlc" key={i}>
                    <div className="condition  f--hlc">
                        <Dropdown overlay={menu(v,i)} trigger={['click']}
                                  onClick={this.onGetDBFields}
                                  getPopupContainer={() => document.getElementById(this.props.pId)}>
                            <div className={$class("p--dropDown short field-dropDown")}>
                                <div className="title f--hlc">
                                    {
                                        v.field
                                            ? v.field.substr(1)
                                            : '选择字段'
                                    }
                                    <span className="icon" />
                                </div>
                            </div>
                        </Dropdown>
                        <Dropdown overlay={operation(v,i)} trigger={['click']}
                                  getPopupContainer={() => document.getElementById(this.props.pId)}>
                            <div className={$class("p--dropDown short operation-dropDown")}>
                                <div className="title f--hlc">
                                    {
                                        v.operation
                                            ? v.operation
                                            : '操作'
                                    }
                                    <span className="icon" />
                                </div>
                            </div>
                        </Dropdown>
                        <FormulaInput containerId={this.props.pId}
                                      disabled={this.props.disabled}
                                      minWidth={'110px'}
                                      value={v.compare}
                                      placeholder={'对象／数值'}
                                      objectList={this.props.objectList}
                                      onFocus={this.props.onFocus}
                                      onBlur={this.props.onBlur}
                                      onChange={this.onMenuSelect.bind(this,v, i, 'obj')}/>
                        <button className="close-btn" onClick={this.onRemoveCon.bind(this,v,i)}></button>
                    </div>
                    <button className={$class("plus-btn", {'hidden':i!==0})} onClick={this.onAddCon}>
                        <div className="btn">
                            <span className="heng"></span>
                            <span className="shu"></span>
                        </div>
                    </button>
                </div>)
        };

        return (<div className="db-cons">
            {
                this.state.value&&this.state.value.length>0
                    ?this.state.value.map(con)
                    :null
            }
        </div>)
    }

}

export {DBConsComponent};
