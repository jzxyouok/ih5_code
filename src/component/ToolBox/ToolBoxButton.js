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
        this.drawRect = null;
        this.onDrawRect = this.onDrawRect.bind(this);
        this.onFileUpload = this.onFileUpload.bind(this);
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

        if(this.props.drawRect || this.props.drawRectText){
            //点击时才清除原来有的，再创建drawRect对象
            this.onDrawRect();
        } else {
            WidgetActions['addWidget'](this.props.className, this.props.param);
            ToolBoxAction['deselect']();
        }
    }

    onRightClick(event) {
        event.preventDefault();
        event.stopPropagation();
        ToolBoxAction['selectPrimary'](this.props.cid, this.props.gid);
        ToolBoxAction['deselect']();
    }

    onDrawRect() {
        if(this.drawRect) {
            this.drawRect.end();
            this.drawRect.cleanUp();
            this.drawRect = null;
        }
        this.drawRect = new DrawRect();
        this.drawRect.start();
        this.drawRect.def.promise().then(data => {
            if(this.props.param) {
                this.props.param.positionX = data.positionX;
                this.props.param.positionY = data.positionY;
                this.props.param.shapeWidth = data.shapeWidth;
                this.props.param.shapeHeight = data.shapeHeight;
            }
            if (this.props.upload) {
                //上传
                this.onFileUpload();
                ToolBoxAction['deselect']();
                this.drawRect.end();
                this.drawRect.cleanUp();
                this.drawRect = null;
            } else if(this.props.drawRectText) {
                //弹窗输入文本
                this.drawRect.end();
                //弹窗事件
                this.setState({
                    modal: {
                        isVisible: true,
                        value: ''
                    }
                });
            } else if (this.props.drawRect) {
                //普通画框
                WidgetActions['addWidget'](this.props.className, this.props.param);
                ToolBoxAction['deselect']();
                this.drawRect.end();
                this.drawRect.cleanUp();
                this.drawRect = null;
            }
        },(() => {
            ToolBoxAction['deselect']();
            this.drawRect.end();
            this.drawRect.cleanUp();
            this.drawRect = null;
        }));
    }

    onFileUpload() {
        WidgetActions['chooseFile'](this.props.className, false, (w) => {
            if (w.files.length) {
                var self = this;
                if (self.props.className == 'image') {
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
    }

    // modal的一些操作
    onModalOK() {
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
        ToolBoxAction['deselect']();
        this.drawRect.cleanUp();
        this.drawRect = null;
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
