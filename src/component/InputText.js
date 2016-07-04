import React from 'react';

import { Modal, Button, Input } from 'antd';

class InputText extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            editTextVisible: this.props.visible,
            editText: this.props.editText
        };
        this.onEditTextOk = this.onEditTextOk.bind(this);
        this.onEditTextCancel = this.onEditTextCancel.bind(this);
        this.onEditTextChange = this.onEditTextChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.visible) {
            this.setState({editTextVisible: true, editText:nextProps.editText});
        } else {
            this.setState({editTextVisible: false});
        }
    }

    onEditTextOk() {
        this.props.onEditDone(this.state.editText);
    }

    onEditTextCancel() {
        this.props.onEditDone(null);
    }

    onEditTextChange(v) {
        this.setState({editText: v.target.value});
    }

    render() {
        return (
            <Modal visible={this.state.editTextVisible}
              title={this.props.title} maskClosable={false} onCancel={this.onEditTextCancel}
              footer={[
                <Button key="Ok" type="primary" size="large" onClick={this.onEditTextOk}>Ok</Button>,
                <Button key="Cancel" type="ghost" size="large" onClick={this.onEditTextCancel}>Cancel</Button>
              ]}
            >
            <Input type={this.props.isText ? 'textarea' : 'text'} rows={10} onChange={this.onEditTextChange} value={this.state.editText}></Input>
            </Modal>
        );
    }
}

module.exports = InputText;
