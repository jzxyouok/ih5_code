import React,{PropTypes, Component} from 'react';
import { Modal } from 'antd';
import JSZip from 'jszip';
import cls from 'classnames';
import WidgetActions from '../../actions/WidgetActions';
import ToolBoxAction from '../../actions/ToolBoxAction';
import ToolBoxStore, {isActiveButton} from '../../stores/ToolBoxStore';
import DrawRect from './DrawRect';

// 工具栏按钮（最小单位）
class ToolBoxButton extends Component {
    constructor (props) {
        super(props);
        this.state = {
            selected: isActiveButton(this.props.cid),
            modal: {
                isVisible: false,
                value: ''
            }
        };
        this.drawRect = new DrawRect();
    }

    componentWillMount() {
        //console.log('will mount', this.props.name, this.state.selected);
    }

    componentWillUpdate() {
        //console.log('will update', this.props.name, this.state.selected);
    }

    componentDidMount() {
        this.unsubscribe = ToolBoxStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.drawRect.cleanUp();
    }

    onStatusChange(store) {
        let status = (store.activeButtonId === this.props.cid);
        if(status === this.state.selected) return;
        this.setState({
            selected: status
        });
    }

    onClick() {
        //console.log(this.props);
        if(this.props.isPrimary) {
            ToolBoxAction['selectPrimary'](this.props.cid, null);
        } else {
            ToolBoxAction['selectSecondary'](this.props.cid, this.props.gid);
        }

        if (this.props.upload) {
            WidgetActions['chooseFile'](this.props.className, false, (w) => {
                if (w.files.length) {
                    var self = this;
                    if (this.props.className == 'image') {
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            WidgetActions['addWidget'](self.props.className, self.props.param, e.target.result);
                        };
                        reader.readAsDataURL(w.files[0]);
                    } else {
                        JSZip.loadAsync(w.files[0])
                          .then(function(zip) {
                            var list = [];
                            var count = 0;
                            zip.forEach(function (relativePath, zipEntry) {
                                if (!zipEntry.dir) {
                                    var name = zipEntry.name;
                                    var dot = name.lastIndexOf('.');
                                    if (dot > 0) {
                                        var ext = name.substr(dot + 1).toLowerCase();
                                        if (ext == 'png' || ext == 'jpeg') {
                                        } else if (ext == 'jpg') {
                                            ext = 'jpeg';
                                        } else {
                                            ext = null;
                                        }
                                        if (ext && name.substr(0, 9) !== '__MACOSX/') {
                                            count++;
                                            zipEntry.async('base64').then(function(data) {
                                                list.push('data:image/' + ext + ';base64,' + data);
                                                count--;
                                                if (count == 0)
                                                    WidgetActions['addWidget'](self.props.className, self.props.param, list);
                                            });
                                        }
                                    }
                                }
                            });
                        });
                    }
                }
            });
        } else {
            if(this.props.className === 'rect'||this.props.className === 'text'|| this.props.className === 'bitmaptext'){
                this.drawRect.start();
                this.drawRect.def.promise().then(data => {
                    if(this.props.className === 'rect') {
                        this.props.param.positionX = data.positionX;
                        this.props.param.positionY = data.positionY;
                        this.props.param.shapeWidth = data.shapeWidth;
                        this.props.param.shapeHeight = data.shapeHeight;
                        WidgetActions['addWidget'](this.props.className, this.props.param);
                        this.drawRect.end();
                        this.drawRect.cleanUp();
                    } else {
                        //弹窗事件
                        this.setState({
                            modal: {
                                isVisible: true,
                                value: ''
                            }
                        });
                        this.drawRect.end();
                    }
                },(() => {
                    this.drawRect.end();
                    this.drawRect.cleanUp();
                }));
            } else {
                WidgetActions['addWidget'](this.props.className, this.props.param);
            }
        }
    }

    onRightClick(event) {
        event.preventDefault();
        event.stopPropagation();
        ToolBoxAction['selectPrimary'](this.props.cid, this.props.gid);
    }

    // modal的一些操作
    onModalOK() {
        this.props.param.positionX = this.drawRect.result.positionX;
        this.props.param.positionY = this.drawRect.result.positionY;
        this.props.param.shapeWidth = this.drawRect.result.shapeWidth;
        this.props.param.shapeHeight = this.drawRect.result.shapeHeight;
        this.props.param.text = this.state.modal.value;
        WidgetActions['addWidget'](this.props.className, this.props.param);
        this.onModalClear();
    }

    onModalCancel() {
        this.onModalClear();
    }

    onModalTextAreaChange(event) {
        this.setState({
            modal: {
                isVisible: true,
                value: event.target.value
            }
        })
    }

    onModalClear(){
        this.drawRect.end();
        this.drawRect.cleanUp();
        this.setState({
            modal: {
                isVisible: false,
                value: ''
            }
        });
    }

    render() {
        return (
            <button
                className={cls('ToolBoxButton',
                {'ToolBoxButtonPrimary': this.props.isPrimary},
                {'active': this.state.selected})}
                title={this.props.name}
                onClick={this.onClick.bind(this)}
                onContextMenu={this.onRightClick.bind(this)}>
                <img src={this.props.icon} />
                <span className='ToolBoxButtonName'>{this.props.name}</span>
                <Modal  visible={this.state.modal.isVisible}
                        title={<div className="title">
                            <img src="img/toolButton-text.svg" />
                            <span>文本内容</span>
                        </div>}
                        maskClosable={false}
                        closable={false}
                        width={490}
                        wrapClassName="vertical-center-modal tool-box-button-modal"
                        onOk={this.onModalOK.bind(this)}
                        onCancel={this.onModalCancel.bind(this)}>
                    <textarea className="body-textarea" value={this.state.modal.value} onChange={this.onModalTextAreaChange.bind(this)}>
                    </textarea>
                </Modal>
            </button>
        );
    }
}

ToolBoxButton.propTypes = {
    cid: PropTypes.number,
    gid: PropTypes.number,
    name: PropTypes.string,
    icon: PropTypes.string,
    url: PropTypes.string,
    type: PropTypes.string,
    className: PropTypes.string.isRequired,
    isPrimary: PropTypes.bool
};

module.exports = ToolBoxButton;
