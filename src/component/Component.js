import React,{PropTypes} from 'react';
import WidgetActions from '../actions/WidgetActions';
import JSZip from 'jszip';

class Component extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            selected: props.selected
        };
    }

    onClick() {
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
                                            zipEntry.async("base64").then(function(data) {
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

    render() {
        return (
            <img src={this.props.icon} style={{height:'32px',width:'32px',margin:'5px'}} onClick={this.onClick.bind(this)} />
        );
    }
}

Component.propTypes = {
    cid: PropTypes.number,
    icon: PropTypes.string,
    url: PropTypes.string,
    type: PropTypes.string
};

module.exports = Component;
