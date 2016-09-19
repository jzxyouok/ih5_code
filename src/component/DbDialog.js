import React from 'react';

import { Modal, Button, Input, Table } from 'antd';
import WidgetActions from '../actions/WidgetActions';

const columns = [{
  title: '名字',
  dataIndex: 'name'
}, {
  title: '字段',
  dataIndex: 'header'
}];

var PREFIX = 'app/';

class DbDialog extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            editTextVisible: this.props.visible,
            editText: null,
            editText2: null,
            dbParm: null
        };
        this.selectRecord = null;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dbList) {
            this.setState({dbParm: nextProps.dbList});
        }
        if (nextProps.visible) {
            this.setState({editTextVisible: true});
        } else {
            this.setState({editTextVisible: false});
        }
    }

    onEditCreate() {
        if (this.state.editText && this.state.editText2) {
            var data = "name=" + encodeURIComponent(this.state.editText) + "&header=" + encodeURIComponent(this.state.editText2);
            WidgetActions['ajaxSend'](null, 'POST', PREFIX + 'dbParm?' + data, null, null, function(text) {
                var result = JSON.parse(text);
                if (result['id']) {
                    var list = this.state.dbParm;
                    list.push({'id': result['id'], 'key': result['id'], 'name': this.state.editText, 'header': this.state.editText2});
                    this.setState({'dbParm': list});
                    this.props.onUpdateDb(list);
                }
            }.bind(this));
        }
    }


    onEditUpdate() {
        if (this.state.editText && this.state.editText2 && this.selectRecord) {
            var data = "id=" + this.selectRecord['id'] + "&name=" + encodeURIComponent(this.state.editText) + "&header=" + encodeURIComponent(this.state.editText2);
            WidgetActions['ajaxSend'](null, 'POST', PREFIX + 'dbParm?' + data, null, null, function(text) {
                var result = JSON.parse(text);
                if (result['id']) {
                    this.selectRecord['name'] = this.state.editText;
                    this.selectRecord['header'] = this.state.editText2;
                    this.setState({'dbParm': this.state.dbParm});
                    this.props.onUpdateDb(this.state.dbParm);
                }
            }.bind(this));
        }
    }

    onEditClose() {
        this.setState({editTextVisible: false});
    }

    onEditTextChange(v) {
        this.setState({editText: v.target.value});
    }

    onEditTextChange2(v) {
        this.setState({editText2: v.target.value});
    }

    onEditFunc(record) {
        this.selectRecord = record;
        this.setState({editText: record['name'], editText2: record['header']});
    }

    render() {
        return (
            <Modal visible={this.state.editTextVisible}
              title={this.props.title} maskClosable={false}
              footer={[
                <Button key="Create" type="primary" size="large" onClick={this.onEditCreate.bind(this)}>Create</Button>,
                <Button key="Update" type="primary" size="large" onClick={this.onEditUpdate.bind(this)}>Update</Button>,
                <Button key="Close" type="primary" size="large" onClick={this.onEditClose.bind(this)}>Close</Button>,
              ]}
            >
            名字: <Input onChange={this.onEditTextChange.bind(this)} value={this.state.editText}></Input>
            字段: <Input onChange={this.onEditTextChange2.bind(this)} value={this.state.editText2}></Input>
            数据库列表:
            <Table columns={columns} onRowClick={this.onEditFunc.bind(this)} dataSource={this.state.dbParm} size="small" pagination={false} />
            </Modal>
        );
    }
}

module.exports = DbDialog;
