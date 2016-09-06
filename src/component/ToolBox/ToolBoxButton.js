import React,{PropTypes, Component} from 'react';
import JSZip from 'jszip';
import cls from 'classnames';
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
            WidgetActions['addWidget'](this.props.className, this.props.param);
        }
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
                {'ToolBoxButtonLinkPrimary': this.props.linkPrimary},
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
