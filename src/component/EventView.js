import React from 'react';

import { Table, Modal, Input, Button } from 'antd';

import WidgetStore from '../stores/WidgetStore';

import {propertyMap} from './PropertyMap';

const columns = [{
  title: 'Events',
  dataIndex: 'name',
  render: (text) => <span>{text}</span>
}];

class EventView extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            eventData: null,
            editVisible: false
        };
        this.currentWidget = null;
        this.handleOk = this.handleOk.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if (widget.selectWidget !== undefined) {
            this.currentWidget = widget.selectWidget;
            let data = [];
            if (this.currentWidget && propertyMap[this.currentWidget.className])
                propertyMap[this.currentWidget.className].map((item, index) => {
                    if (item.isEvent)
                        data.push({'name': item.name, key:index});
                });
            this.setState({eventData: data});
        }
        if(widget.historyPropertiesUpdate){
            this.forceUpdate();
        }
    }

    onRowClick(record) {
        this.currentEvent = record['name'];
        if (this.currentWidget.events[this.currentEvent] && this.currentWidget.events[this.currentEvent]['func'])
            this.setState({editVisible: true, editText: this.currentWidget.events[this.currentEvent]['func']});
        else
            this.setState({editVisible: true, editText: ''});
    }

    handleOk() {
        this.currentWidget.events[this.currentEvent] = this.currentWidget.events[this.currentEvent] || {};
        this.currentWidget.events[this.currentEvent]['func'] = this.state.editText;
        this.setState({editVisible: false});
    }

    handleCancel() {
        this.setState({editVisible: false})
    }

    onChange(v) {
        this.setState({editText: v.target.value});
    }

    render() {
        return (<div>
            <Table columns={columns} onRowClick={this.onRowClick.bind(this)} dataSource={this.state.eventData} size="small" pagination={false} />
            <Modal visible={this.state.editVisible}
              title="编辑" maskClosable={false} onCancel={this.handleCancel}
              footer={[
                <Button key="Ok" type="primary" size="large" loading={this.state.loading} onClick={this.handleOk}>Ok</Button>,
                <Button key="Cancel" type="ghost" size="large" onClick={this.handleCancel}>Cancel</Button>
              ]}
            >
            <Input type="textarea" rows={10} onChange={this.onChange} value={this.state.editText}></Input>
            </Modal>
            </div>
            );
    }
}

module.exports = EventView;
