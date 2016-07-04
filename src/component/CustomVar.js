import React from 'react';

import { Button, Table, Form, Modal, Input } from 'antd';

const ButtonGroup = Button.Group;

const varColumns = [{
  title: '名字',
  dataIndex: 'key'
}, {
  title: '值',
  dataIndex: 'value'
}];

class CustomVar extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            editVarVisible: false,
            varName:null,
            varText:null,
            varType:0,
            varList:this.props.varList
        };
        this.currentWidget = this.props.currentWidget;
    }

    componentWillReceiveProps(nextProps) {
        this.currentWidget = nextProps.currentWidget;
        this.setState({varList: nextProps.varList});
    }

    onAddVar() {
        if (this.currentWidget != null) {
            this.rowIndex = -1;
            this.setState({editVarVisible: true, varName: null, varText:null, varType:this.props.isFunc ? 1 : 0});
        }
    }

    onVarRowClick(record, index) {
        this.rowIndex = index;
        this.setState({editVarVisible: true, varName: record['key'], varText:record['value'], varType:typeof record['value'] == 'number' ? 0 : 1});
    }


    setVarTypeNum() {
        this.setState({varType:0});
    }

    setVarTypeStr() {
        this.setState({varType:1});
    }

    onEditVarNameChange(v) {
        this.setState({varName: v.target.value});
    }

    onEditVarTextChange(v) {
        this.setState({varText: v.target.value});
    }

    onEditVarOk() {
        if (this.state.varName && this.state.varText) {
            let result = this.state.varList;
            if (this.rowIndex < 0) {
                result.push({key:this.state.varName, value:(this.state.varType == 0) ? parseFloat(this.state.varText) : this.state.varText});
            } else {
                result[this.rowIndex]['key'] = this.state.varName;
                result[this.rowIndex]['value'] = (this.state.varType == 0) ? parseFloat(this.state.varText) : this.state.varText;
            }
            this.setState({varList:result, editVarVisible: false});
        } else {
            this.setState({editVarVisible: false});
        }
    }

    onEditVarCancel() {
        this.setState({editVarVisible: false})
    }

    onEditVarDelete() {
        if (this.rowIndex >= 0) {
            let result = this.state.varList;
            result.splice(this.rowIndex, 1);
            this.setState({varList:result, editVarVisible: false});
        } else {
            this.setState({editVarVisible: false})
        }
    }

    render() {
        return (
            <div>
                <Button onClick={this.onAddVar.bind(this)}>添加</Button>
                <Table onRowClick={this.onVarRowClick.bind(this)} columns={varColumns} dataSource={this.state.varList} size="small" pagination={false} />
                <Modal visible={this.state.editVarVisible}
                  title="编辑变量" maskClosable={false} onCancel={this.onEditVarCancel.bind(this)}
                  footer={[
                    <Button key="Ok" type="primary" size="large" onClick={this.onEditVarOk.bind(this)}>Ok</Button>,
                    <Button key="Cancel" type="ghost" size="large" onClick={this.onEditVarCancel.bind(this)}>Cancel</Button>,
                    <Button key="Delete" type="ghost" size="large" onClick={this.onEditVarDelete.bind(this)}>Delete</Button>
                  ]}
                >
                <Form>
                <Form.Item label="Name"><Input onChange={this.onEditVarNameChange.bind(this)} value={this.state.varName}></Input></Form.Item>
                { (this.props.isFunc) ? null :
                (<Form.Item label="Type">
                    <ButtonGroup>
                        <Button type={(this.state.varType == 0) ? 'primary' : 'ghost'} onClick={this.setVarTypeNum.bind(this)}>Number</Button>
                        <Button type={(this.state.varType == 1) ? 'primary' : 'ghost'} onClick={this.setVarTypeStr.bind(this)}>String</Button>
                    </ButtonGroup>
                </Form.Item>)
                }
                <Form.Item label="Value"><Input type={(this.state.varType == 1) ? 'textarea' : 'text'} rows={10} onChange={this.onEditVarTextChange.bind(this)} value={this.state.varText}></Input></Form.Item>
                </Form>
                </Modal>
            </div>);
    }
}

module.exports = CustomVar;
