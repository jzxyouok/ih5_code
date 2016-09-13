import React,{PropTypes, Component} from 'react';
import { Modal } from 'antd';
import JSZip from 'jszip';
import cls from 'classnames';
import $ from 'jquery';
import WidgetActions from '../../actions/WidgetActions';
import ToolBoxAction from '../../actions/ToolBoxAction';
import ToolBoxStore, {isActiveButton} from '../../stores/ToolBoxStore';

// 工具栏按钮（最小单位）
class ToolBoxButton extends Component {
    constructor (props) {
        super(props);
        this.state = {
            selected: isActiveButton(this.props.cid),
            modal: {
                isVisible: false,
                value: ''
            },
            drawRectFlag: false,
            propsParam: {
                positionX: 0,
                positionY: 0,
                shapeWidth: 0,
                shapeHeight: 0
            }
        };
        this.self = this;

        this.onDrawRect = this.onDrawRect.bind(this);
        this.onModalOK = this.onModalOK.bind(this);
        this.onModalCancel = this.onModalCancel.bind(this);
        this.onModalTextAreaChange = this.onModalTextAreaChange.bind(this);
        this.onModalClear = this.onModalClear.bind(this);
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
                this.onDrawRect().then(data => {
                    if(this.props.className === 'rect') {
                        document.body.removeChild(document.getElementById('drawRect'));
                        this.props.param.positionX = data.positionX;
                        this.props.param.positionY = data.positionY;
                        this.props.param.shapeWidth = parseInt(data.shapeWidth);
                        this.props.param.shapeHeight = parseInt(data.shapeHeight);
                        WidgetActions['addWidget'](this.props.className, this.props.param);
                        this.setState(
                            {drawRectFlag:false}
                        );
                    } else {
                        //弹窗事件
                        this.setState({
                            propsParam: {
                                positionX: data.positionX,
                                positionY: data.positionY,
                                shapeWidth: parseInt(data.shapeWidth),
                                shapeHeight: parseInt(data.shapeHeight)
                            },
                            modal: {
                                isVisible: true,
                                value: ''
                            }
                        });
                    }
                });
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

    // 画图的实现
    onDrawRect() {
        let startX = 0, startY = 0;
        let rectLeft = "0px", rectTop = "0px", rectHeight = "0px", rectWidth = "0px";
        var def = $.Deferred();

        var mouseDown = e => {
            e.preventDefault();
            e.stopPropagation();
            this.setState(
                {drawRectFlag:true}
            );
            //创建临时的方框div
            var evt = window.event || e;
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
            startX = evt.clientX + scrollLeft;
            startY = evt.clientY + scrollTop;
            var div = document.createElement("div");
            div.id = 'drawRect';
            div.className = "div";
            div.style.position = "absolute";
            div.style.left = startX + "px";
            div.style.top = startY + "px";
            div.style.backgroundColor = '#a0a0a0';
            div.style.opacity = '0.2';
            div.style.border = '1px solid #000';
            document.body.appendChild(div);
        };

        var mouseUp = e => {
            e.preventDefault();
            e.stopPropagation();
            //画图结束
            removeDrawEventListner();
            var canvasRect = document.getElementById('canvas-dom').getBoundingClientRect();
            var result = {
                shapeWidth: rectWidth,
                shapeHeight: rectHeight,
                positionX: parseInt(rectLeft) - canvasRect.left,
                positionY: parseInt(rectTop) - canvasRect.top
            };
            if(this.state.drawRectFlag) {
                def.resolve(result);
            } else {
                def.reject();
            }
        };

        var mouseMove = e => {
            e.preventDefault();
            e.stopPropagation();
            if(this.state.drawRectFlag){
                //画图跟踪
                var evt = window.event || e;
                var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
                var drawRectDiv = document.getElementById('drawRect');
                rectLeft = (startX - evt.clientX - scrollLeft > 0 ? evt.clientX + scrollLeft : startX) + "px";
                rectTop = (startY - evt.clientY - scrollTop > 0 ? evt.clientY + scrollTop : startY) + "px";
                rectHeight = Math.abs(startY - evt.clientY - scrollTop) + "px";
                rectWidth = Math.abs(startX - evt.clientX - scrollLeft) + "px";
                drawRectDiv.style.left = rectLeft;
                drawRectDiv.style.top = rectTop;
                drawRectDiv.style.width = rectWidth;
                drawRectDiv.style.height = rectHeight;
            }
        };

        var addDrawEventListener = () => {
            //添加listener
            document.body.style.cursor = 'crosshair';
            document.body.addEventListener('mousedown', mouseDown);
            document.body.addEventListener('mouseup', mouseUp);
            document.body.addEventListener('mousemove', mouseMove);
        };

        var removeDrawEventListner = () => {
            //移除listener
            document.body.style.cursor = 'auto';
            document.body.removeEventListener('mousedown', mouseDown);
            document.body.removeEventListener('mouseup', mouseUp);
            document.body.removeEventListener('mousemove', mouseMove);
        };

        addDrawEventListener();

        return def.promise();
    }

    // modal的一些操作
    onModalOK() {
        this.props.param.positionX = this.state.propsParam.positionX;
        this.props.param.positionY = this.state.propsParam.positionY;
        this.props.param.shapeWidth = this.state.propsParam.shapeWidth;
        this.props.param.shapeHeight = this.state.propsParam.shapeHeight;
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
        document.body.removeChild(document.getElementById('drawRect'));
        this.setState({
            drawRectFlag: false,
            modal: {
                isVisible: false,
                value: ''
            },
            propsParam: {
                positionX: 0,
                positionY: 0,
                shapeWidth: 0,
                shapeHeight: 0
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
                <Modal  ref="modal"
                        visible={this.state.modal.isVisible}
                        maskClosable={false}
                        closable={false}
                        wrapClassName="vertical-center-modal"
                        onOk={this.onModalOK.bind(this)}
                        onCancel={this.onModalCancel.bind(this)}>
                    <textarea value={this.state.modal.value} onChange={this.onModalTextAreaChange.bind(this)}>
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
