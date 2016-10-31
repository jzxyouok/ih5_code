/**
 * Created by vxplo on 2016/10/31.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import cls from 'classnames';
import { Form, Input, InputNumber, Slider, Switch, Collapse,Select,Dropdown,Menu} from 'antd';
const Option = Select.Option;
const Panel = Collapse.Panel;
const MenuItem = Menu.Item;
import { SwitchMore,DropDownInput ,ConInputNumber} from  './PropertyViewComponet';

// import WidgetStore, {dataType} from '../../stores/WidgetStore';
// import WidgetActions from '../../actions/WidgetActions';
// import {propertyType, propertyMap} from '../PropertyMap';
// import {chooseFile} from  '../../utils/upload';
// require("jscolor/jscolor");
// import TbCome from '../TbCome';

class PropertyViewSetUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            className:props.classType
        };
    }
    componentDidMount() {

    }

    componentWillReceiveProps(){

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div>属性面板:{this.state.className}</div>
        );
    }
}

// export {PropertyViewSetUp};
module.exports = PropertyViewSetUp;