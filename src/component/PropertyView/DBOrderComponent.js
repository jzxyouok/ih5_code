import React from 'react';
import $class from 'classnames';
import {Dropdown,Menu} from 'antd';
import {SwitchTwo} from '../PropertyView/PropertyViewComponet';

const MenuItem = Menu.Item;

class DBOrderComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value || {field:null, asc:true}
        };
        this.onSwitchChange = this.onSwitchChange.bind(this);
        this.onMenuSelect = this.onMenuSelect.bind(this);
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


    render () {

        let menu = (<Menu onClick={this.onMenuSelect}>
            {
                !this.props.list||this.props.list.length==0
                    ? null
                    : this.props.list.map((v, i)=>{
                        return <MenuItem field={v} key={i}>{v}</MenuItem>;
                })
            }
        </Menu>);


        return (<div className="db-order f--hlc">
            <Dropdown overlay={menu} trigger={['click']}
                      getPopupContainer={() => document.getElementById(this.props.pId)}>
                <div className={$class("p--dropDown short db-order-dropDown")}>
                    <div className="title f--hlc">
                        {
                            this.state.value.field
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

