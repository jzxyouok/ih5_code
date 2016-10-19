/**
 * Created by Brian on 19/10/2016.
 */

import React from 'react';
import $class from 'classnames'
import { Menu, Dropdown } from 'antd';
import { Input } from 'antd';

import WidgetStore from '../../stores/WidgetStore'

const inputType = {
    value: 1,
    formula: 2,
};

const MenuItem = Menu.Item;

class FormulaInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: inputType.value,
            objectList: []
        };

        this.containerId = 'iH5-App';

        this.onStatusChange = this.onStatusChange.bind(this);
        this.onActiveSelectTargetMode = this.onActiveSelectTargetMode.bind(this);
        this.onObjectVisibleChange = this.onObjectVisibleChange.bind(this);
        this.onObjectSelect = this.onObjectSelect.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    componentWillReceiveProps(nextProps) {
        this.containerId = nextProps.containerId;
        this.setState({
            objectList: nextProps.objectList||[]
        })
    }

    onStatusChange(widget) {
        if(!widget) {
            return;
        }
        if(widget.allWidgets){
            this.setState({
                objectList: widget.allWidgets
            });
        }
    }

    onActiveSelectTargetMode() {

    }

    onObjectVisibleChange(){

    }
    onObjectSelect(){

    }

    render() {

        let formulaWidget = (
            <div>
                formula
            </div>
        );

        let objectMenuItem = (v1,i)=>{
            return  <MenuItem key={i} object={v1}>{v1.props.name}</MenuItem>
        };

        let objectMenu = (
            <Menu onClick={this.onObjectSelect}>
                {
                    !this.state.objectList||this.state.objectList.length==0
                        ? null
                        : this.state.objectList.map(objectMenuItem)
                }
            </Menu>
        );

        let valueWidget = (
            <div className="value-mode">
                <Dropdown overlay={objectMenu} trigger={['click']}
                          getPopupContainer={() => document.getElementById(this.containerId)}
                          onVisibleChange={this.onVisibleChange}>
                    <div className={$class("formula--dropDown short")}>
                        <div className="formula-title f--hlc">
                            <button className={$class('formula-object-icon')}
                                    onClick={this.onActiveSelectTargetMode} />
                            <Input placeholder="比较值／对象"/>
                            <span className="value-right-icon" />
                        </div>
                    </div>
                </Dropdown>
            </div>
        );

        return (
            <div className='formulaInput'>
                {
                    this.state.type === inputType.value
                        ? valueWidget
                        : formulaWidget
                }
            </div>
        );
    }
}

export {FormulaInput};
