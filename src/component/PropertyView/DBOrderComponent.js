import React from 'react';
import $class from 'classnames';
import {Dropdown,Menu} from 'antd';
import {SwitchTwo} from '../PropertyView/PropertyViewComponet';
import WidgetActions from '../../actions/WidgetActions'

const MenuItem = Menu.Item;

class DBOrderComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fieldList: [],
            value: props.value || {field:null, asc:true}
        };
        this.onSwitchChange = this.onSwitchChange.bind(this);
        this.onMenuSelect = this.onMenuSelect.bind(this);
        this.onGetDBFields = this.onGetDBFields.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value || {field:null, asc:true}
        });
    }

    onSwitchChange(e) {
        let value = this.state.value;
        value.asc = e;
        this.setState({
            value: value
        }, ()=>{
            this.props.onChange(this.state.value);
        })
    }


    onMenuSelect(e) {
        let value = this.state.value;
        value.field = e.item.props.field;
        this.setState({
            value: value
        }, ()=>{
            this.props.onChange(this.state.value);
        })
    }

    onGetDBFields(e) {
        if(this.props.obj) {
            let obj = this.props.obj;
            WidgetActions['ajaxSend'](null, 'POST', 'app/dbGetParm/' + obj.props.dbid, null, null, function(text) {
                var result = JSON.parse(text);
                //console.log(result);
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

    render () {
        let menu = (<Menu onClick={this.onMenuSelect}>
            {
                !this.state.fieldList||this.state.fieldList.length==0
                    ? null
                    : this.state.fieldList.map((v, i)=>{
                        return <MenuItem field={v} key={i}>{v.substr(1)}</MenuItem>;
                })
            }
        </Menu>);


        return (<div className="db-order f--hlc">
            <Dropdown overlay={menu} trigger={['click']}
                      onClick={this.onGetDBFields}
                      getPopupContainer={() => document.getElementById(this.props.pId)}>
                <div className={$class("p--dropDown short db-order-dropDown")}>
                    <div className="title f--hlc">
                        {
                            this.state.value.field
                                ? this.state.value.field.substr(1)
                                : '选择字段'
                        }
                        <span className="icon" />
                    </div>
                </div>
            </Dropdown>
            <SwitchTwo onChange={this.onSwitchChange} checked={this.state.value.asc} onName={'升序'} offName={'降序'}/>
            </div>)


    }
}

export {DBOrderComponent};

