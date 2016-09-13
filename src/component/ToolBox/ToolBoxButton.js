import React,{PropTypes, Component} from 'react';
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
            selected: isActiveButton(this.props.cid)
        };
        this.self = this;

        this.onDrawRect = this.onDrawRect.bind(this);
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
            if (this.props.className === 'rect') {
                this.onDrawRect(false).then(data => {
                    this.props.param.shapeWidth = parseInt(data.shapeWidth);
                    this.props.param.shapeHeight = parseInt(data.shapeHeight);
                    WidgetActions['addWidget'](this.props.className, this.props.param);
                });
            } else if (this.props.className === 'text'|| this.props.className === 'bitmaptext'){
                this.onDrawRect(true).then(data => {
                    this.props.param.text = data.text;
                    WidgetActions['addWidget'](this.props.className, this.props.param);
                });
            } else {
                WidgetActions['addWidget'](this.props.className, this.props.param);
            }
        }
    }

    onDrawRect(isText) {
        let startX = 0, startY = 0;
        let rectLeft = "0px", rectTop = "0px", rectHeight = "0px", rectWidth = "0px";
        let flag = false;
        var def = $.Deferred();

        var mouseDown = e => {
            e.preventDefault();
            e.stopPropagation();
            flag = true;
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
            div.style.border = '1px dotted white';
            document.body.appendChild(div);
        };

        var mouseUp = e => {
            e.preventDefault();
            e.stopPropagation();
            //画图结束
            var drawRectDiv = document.getElementById('drawRect');
            var result;
            if(isText) {
                //弹窗事件
                result = {text:popUpEdit()};
            } else {
                result = {shapeWidth:rectWidth,shapeHeight:rectHeight};
            }
            flag = false;
            document.body.removeChild(drawRectDiv);
            removeDrawEventListner();
            def.resolve(result);
        };

        var mouseMove = e => {
            e.preventDefault();
            e.stopPropagation();
            if(flag){
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

        var popUpEdit = () => {
            //弹窗后填写的结果，需要回调
            return 'testing';
        };

        addDrawEventListener();

        return def.promise();
    }

    onRightClick(event) {
        event.preventDefault();
        event.stopPropagation();
        ToolBoxAction['selectPrimary'](this.props.cid, this.props.gid);
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
