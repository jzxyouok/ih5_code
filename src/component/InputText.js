import React from 'react';
import ReactDOM from 'react-dom';

import { Modal, Button, Input } from 'antd';

var CodeMirror = require('codemirror/CodeMirror');

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
        this.onCodeChange = this.onCodeChange.bind(this);
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

    onCodeChange(v) {
        this.setState({editText: v});
    }

    render() {
        return (
            <Modal visible={this.state.editTextVisible}
              title={this.props.title} maskClosable={false} onCancel={this.onEditTextCancel}
              width={(this.props.isText) ? "90%" : 520}
              footer={[
                <Button key="Ok" type="primary" size="large" onClick={this.onEditTextOk}>Ok</Button>,
                <Button key="Cancel" type="ghost" size="large" onClick={this.onEditTextCancel}>Cancel</Button>
              ]}
            >
            {
                (this.props.isText) ? <CodeMirror onChange={this.onCodeChange} value={this.state.editText} options={{'lineNumbers': true}}></CodeMirror> : <Input onChange={this.onEditTextChange} value={this.state.editText}></Input>
            }
            </Modal>
        );
    }
}

module.exports = InputText;
