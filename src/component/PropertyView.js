import React from 'react';
import ReactDOM from 'react-dom';

import { Form, Input, InputNumber, Slider, Switch, Collapse } from 'antd';
const Panel = Collapse.Panel;

import WidgetStore from '../stores/WidgetStore';
import WidgetActions from '../actions/WidgetActions';

import {propertyType, propertyMap} from './PropertyMap';

require("jscolor/jscolor");

function getInputBox(type, defaultProp) {
    switch (type) {
        case propertyType.Integer:
            return <InputNumber {...defaultProp} />;

        case propertyType.Number:
            return <InputNumber step={0.1} {...defaultProp} />;

        case propertyType.Percentage:
            return <Slider max={1} step={0.001} {...defaultProp} />;

        case propertyType.Text:
            return <Input type="textarea" {...defaultProp} />;

        case propertyType.Color:
            return <Input ref={(input) => {
                if (input) {
                    var dom = ReactDOM.findDOMNode(input).firstChild;
                    if (!dom.jscolor) {
                        dom.jscolor = new window.jscolor(dom, {hash:true, required:false});
                        dom.jscolor.onFineChange = defaultProp.onChange;
                    }
                }
            }} {...defaultProp} />;

        case propertyType.Boolean:
            return <Switch {...defaultProp} />;

        default:
            return <Input {...defaultProp} />;
    }
}

class PropertyView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {fields: null};
        this.selectNode = null;
        this.currentPage = null;
    }

    onChangeProp(prop, value) {
        let v;

        if (value === undefined) {
            v = null;
        } else {
            switch (prop.type) {
                case propertyType.Percentage:
                    v = parseFloat(value);
                    if (v === prop.default)
                        v = null;
                    break;

                case propertyType.Number:
                    v = parseFloat(value);
                    break;

                case propertyType.Integer:
                    v = parseInt(value);
                    break;

                case propertyType.Boolean:
                    v = (value === prop.default) ? null : value;
                    break;

                default:
                    v = value;
            }
        }

        const obj = {};
        obj[prop.name] = v;
        this.onStatusChange({updateProperties: obj});
        WidgetActions['updateProperties'](obj, false, true);
    }

    onChangePropDom(item, value) {
        this.onChangeProp(item, (value && value.target.value !== '') ? value.target.value : undefined);
    }

    getFields() {
        let node = this.selectNode;

        if (!node)
            return;

        let className = node.className;
        if (className.charAt(0) == '_')
            className = 'class';

        if (!propertyMap[className])
            return null;

        const formItemLayout = {
            labelCol: { span: 12 },
            wrapperCol: { span: 12 }
        };
        const groups = {};

        const getInput = item => {
            let defaultValue;
            if (item.readOnly) {
                defaultValue = node.node[item.name];
            } else {
                if (node.props[item.name] === undefined)
                    defaultValue = (item.type === propertyType.Boolean || item.type === propertyType.Percentage) ? item.default : '';
                else
                    defaultValue = node.props[item.name];
            }

            const defaultProp = {
                size: 'small',
                placeholder: item.default,
                disabled: item.readOnly !== undefined,
                onChange: (item.type === propertyType.String || item.type === propertyType.Text || item.type === propertyType.Color) ? this.onChangePropDom.bind(this, item) : this.onChangeProp.bind(this, item)
            };
            if (item.type === propertyType.Boolean) {
                defaultProp.checked = defaultValue;
            } else {
                defaultProp.value = defaultValue;
            }

            let groupName = item.group || 'basic';
            if (groups[groupName] === undefined)
                groups[groupName] = [];

            groups[groupName].push(<Form.Item key={item.name} label={item.name} {...formItemLayout}>{getInputBox(item.type, defaultProp, item.readOnly !== undefined)}</Form.Item>);
        };

        const result = [];

        propertyMap[className].forEach((item, index) => {
            if (item.isProperty)
                getInput(item, index);
        });

        for (let name in groups) {
            result.push(<Panel header={name} key={name}><Form horizontal>{groups[name]}</Form></Panel>);
        }

        return result;
    }

    onStatusChange(widget) {
        if (widget.selectWidget !== undefined){
            this.selectNode = widget.selectWidget;
            this.setState({fields: this.getFields()});
            let node = this.selectNode;
            while (node != null) {
                if (node.className == 'page') {
                    if (node != this.currentPage) {
                        this.currentPage = node;
                        node.parent.node['gotoPage'](node.node);
                    }
                    break;
                }
                node = node.parent;
            }
        } else if (widget.updateProperties !== undefined && widget.skipProperty === undefined) {
            let needRender = (widget.skipRender === undefined);
            let selectNode = this.selectNode;
            let obj = widget.updateProperties;
            let className = selectNode.className;
            if (className.charAt(0) == '_')
                className = 'class';
            propertyMap[className].map(item => {
                if (item.isProperty && obj[item.name] !== undefined) {
                    if (obj[item.name] === null) {
                        delete(selectNode.props[item.name]);
                        if (needRender)
                            selectNode.node[item.name] = item.default;
                    } else {
                        selectNode.props[item.name] = obj[item.name];
                        if (needRender)
                            selectNode.node[item.name] = obj[item.name];

                    }
                }
            });
            if (needRender)
                WidgetActions['render']();
            this.setState({fields: this.getFields()});
        }
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        return (<Collapse accordion defaultActiveKey={['basic']}>{this.state.fields}</Collapse>);
    }
}

module.exports = PropertyView;
