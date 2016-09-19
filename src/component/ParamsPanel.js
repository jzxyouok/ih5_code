import React from 'react';

import { Tabs, Table } from 'antd';
import WidgetActions from '../actions/WidgetActions';
import WidgetStore from '../stores/WidgetStore';
import CustomVar from './CustomVar';
import InputText from './InputText';

import {propertyMap} from './PropertyMap';

const TabPane = Tabs.TabPane;

const columns = [{
  title: '名字',
  dataIndex: 'name'
}, {
  title: '参数',
  dataIndex: 'info'
}];

class ParamsPanel extends React.Component{
    constructor (props) {
        super(props);
        this.state = {
            eventData: null,
            funcData: null,
            varList:null,
            funcList:null,
            currentWidget: null
        };
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if (widget.selectWidget !== undefined) {
            let currentWidget = widget.selectWidget;
            let eventData = [];
            let funcData = [];
            let className;

            if (currentWidget) {
                className = currentWidget.className;
                if (className.charAt(0) == '_')
                    className = 'class';
            }
            if (currentWidget && propertyMap[className])
                propertyMap[className].map((item, index) => {
                    if (item.isEvent)
                        eventData.push({'name': item.name, 'info': item.info, key:index});
                    else if (item.isFunc)
                        funcData.push({'name': item.name, 'info': item.info, key:index});
                });
            this.setState({currentWidget: currentWidget, eventData: eventData, funcData: funcData,
                varList:currentWidget ? currentWidget.varList : null,
                funcList:currentWidget ? currentWidget.funcList : null});
        }
    }

    onEditFunc(record) {
        this.currentEvent = record['name'];
        if (this.state.currentWidget.events[this.currentEvent] && this.state.currentWidget.events[this.currentEvent]['func'])
            this.setState({editTextVisible: true, editText: this.state.currentWidget.events[this.currentEvent]['func']});
        else
            this.setState({editTextVisible: true, editText: ''});
    }

    onEditDone(s) {
        if (s !== null) {
            if (s) {
                this.state.currentWidget.events[this.currentEvent] = this.state.currentWidget.events[this.currentEvent] || {};
                this.state.currentWidget.events[this.currentEvent]['func'] = s;
                WidgetActions['modifyNode']();
            } else {
                delete this.state.currentWidget.events[this.currentEvent];
            }
        }
        this.setState({editTextVisible: false});
    }

    render() {
        return (
            <div>
            <Tabs type="card">
                <TabPane tab="事件" key="1">
                    <Table columns={columns} onRowClick={this.onEditFunc.bind(this)} dataSource={this.state.eventData} size="small" pagination={false} /></TabPane>
                <TabPane tab="变量" key="2">
                    <CustomVar currentWidget={this.state.currentWidget} varList={this.state.varList}></CustomVar>
                </TabPane>
                <TabPane tab="函数" key="3">
                    <CustomVar currentWidget={this.state.currentWidget} isFunc={true} varList={this.state.funcList}></CustomVar>
                </TabPane>
                <TabPane tab="定义" key="4">
                    <Table columns={columns} dataSource={this.state.funcData} size="small" pagination={false} />
                </TabPane>
            </Tabs>
            <InputText title="编辑事件" visible={this.state.editTextVisible} isText={true} editText={this.state.editText} onEditDone={this.onEditDone.bind(this)} />
            </div>
        );
    }
}

module.exports = ParamsPanel;
