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
                this.onDrawRect().then(data => {
                    //可在这设置弹框等内容
                    this.props.param.shapeWidth = parseInt(data.shapeWidth);
                    this.props.param.shapeHeight = parseInt(data.shapeHeight);
                    WidgetActions['addWidget'](this.props.className, this.props.param);
                });
            } else {
                WidgetActions['addWidget'](this.props.className, this.props.param);
            }
        }
    }

    onDrawRect() {
        let startX = 0, startY = 0;
        let retcLeft = "0px", retcTop = "0px", retcHeight = "0px", retcWidth = "0px";
        let flag = false;
        var def = $.Deferred();

        var mouseDown = e => {
            e.preventDefault();
            e.stopPropagation();
            flag = true;
            try{
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
            }catch(e){
                //alert(e);
            }
        };

        var mouseUp = e => {
            e.preventDefault();
            e.stopPropagation();
            try{
                var drawRectDiv = document.getElementById('drawRect');
                document.body.removeChild(drawRectDiv);
                def.resolve({shapeWidth:retcWidth,shapeHeight:retcHeight});
                removeDrawEventListner();
            }catch(e){
                //alert(e);
            }
            flag = false;
        };

        var mouseMove = e => {
            e.preventDefault();
            e.stopPropagation();
            if(flag){
                try{
                    var evt = window.event || e;
                    var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                    var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
                    var drawRectDiv = document.getElementById('drawRect');
                    retcLeft = (startX - evt.clientX - scrollLeft > 0 ? evt.clientX + scrollLeft : startX) + "px";
                    retcTop = (startY - evt.clientY - scrollTop > 0 ? evt.clientY + scrollTop : startY) + "px";
                    retcHeight = Math.abs(startY - evt.clientY - scrollTop) + "px";
                    retcWidth = Math.abs(startX - evt.clientX - scrollLeft) + "px";
                    drawRectDiv.style.left = retcLeft;
                    drawRectDiv.style.top = retcTop;
                    drawRectDiv.style.width = retcWidth;
                    drawRectDiv.style.height = retcHeight;
                }catch(e){
                    //alert(e);
                }
            }
        };

        var addDrawEventListener = () => {
            document.body.style.cursor = 'crosshair';
            document.body.addEventListener('mousedown', mouseDown);
            document.body.addEventListener('mouseup', mouseUp);
            document.body.addEventListener('mousemove', mouseMove);
        };

        var removeDrawEventListner = () => {
            document.body.style.cursor = 'auto';
            document.body.removeEventListener('mousedown', mouseDown);
            document.body.removeEventListener('mouseup', mouseUp);
            document.body.removeEventListener('mousemove', mouseMove);
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
