import React from 'react';

import { Modal, Button, Input } from 'antd';

class LoginDialog extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            editTextVisible: this.props.visible,
            editText: this.props.editText,
            editText2: this.props.editText2
        };
        this.onEditTextOk = this.onEditTextOk.bind(this);
        this.onEditTextChange = this.onEditTextChange.bind(this);
        this.onEditTextChange2 = this.onEditTextChange2.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.visible) {
            this.setState({editTextVisible: true, editText:nextProps.editText});
        } else {
            this.setState({editTextVisible: false});
        }
    }

    onEditTextOk() {
        if (this.state.editText && this.state.editText2)
            this.props.onEditDone(this.state.editText, this.state.editText2);
    }

    onEditTextChange(v) {
        this.setState({editText: v.target.value});
    }

    onEditTextChange2(v) {
        this.setState({editText2: v.target.value});
    }

    render() {
        return (
            <Modal visible={this.state.editTextVisible}
              title={this.props.title} maskClosable={false}
              footer={[
                <Button key="Ok" type="primary" size="large" onClick={this.onEditTextOk}>Ok</Button>,
              ]}
            >
            Username: <Input onChange={this.onEditTextChange} value={this.state.editText}></Input>
            Password: <Input type="password" onChange={this.onEditTextChange2} value={this.state.editText2}></Input>
            </Modal>
        );
    }
}

module.exports = LoginDialog;
