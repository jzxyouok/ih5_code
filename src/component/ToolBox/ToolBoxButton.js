import React,{PropTypes, Component} from 'react';
import { Modal } from 'antd';
import JSZip from 'jszip';
import cls from 'classnames';
import WidgetActions from '../../actions/WidgetActions';
import ToolBoxAction from '../../actions/ToolBoxAction';
import ToolBoxStore, {isActiveButton} from '../../stores/ToolBoxStore';
import DrawRect from './DrawRect';
import {chooseFile} from  '../../utils/upload';

import DbHeaderAction from '../../actions/DbHeader'
import DbHeaderStores from '../../stores/DbHeader';
import getSockListAction from '../../actions/getSockListAction';
import getSockListStore from '../../stores/getSockListStore';
import CreateModuleAction from '../../actions/CreateModuleAction'

var PREFIX = 'app/';

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
            dbList : [],
            selectWidget : null,
            sockList : []
        };
        this.drawRect = null;
        this.onDrawRect = this.onDrawRect.bind(this);
        this.onFileUpload = this.onFileUpload.bind(this);

        this.onModalOK = this.onModalOK.bind(this);
        this.onModalCancel = this.onModalCancel.bind(this);
        this.onModalClear = this.onModalClear.bind(this);
        this.onModalTextAreaChange = this.onModalTextAreaChange.bind(this);
        this.addDb = this.addDb.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = ToolBoxStore.listen(this.onStatusChange.bind(this));
        DbHeaderStores.listen(this.DbHeaderData.bind(this));
        getSockListStore.listen(this.getSockList.bind(this));
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
        if(store.selectWidget){
            this.setState({
                selectWidget : widget.selectWidget
            })
        }
    }

    DbHeaderData(data,bool){
        this.setState({
            dbList : data
        })
    }

    onClick() {
        if(this.props.isPrimary) {
            ToolBoxAction['selectPrimary'](this.props.cid, null);
        } else {
            ToolBoxAction['selectSecondary'](this.props.cid, this.props.gid);
        }

        //点击的时候清除一下overlay
        new DrawRect().cleanUp();
        //第一层已经选择了或者打开了，被选了的话，再点击取消选择
        if(this.state.selected&&(this.props.level==1||(this.props.expanded&&this.props.level==2))) {
            ToolBoxAction['deselect']();
        } else {
            if(this.props.drawRect || this.props.drawRectText){
                //点击时才清除原来有的，再创建drawRect对象
                this.onDrawRect();
            }
            else if(this.props.className === "db"){
                //共享数据库
                if(this.props.DbType == 0){
                    let name = '数据库' + (this.state.dbList.length + 1);
                    let data = "name=" + encodeURIComponent(name) + "&header=" +  null;
                    //console.log(data);
                    WidgetActions['ajaxSend'](null, 'POST', PREFIX + 'dbSetParm?' + data, null, null, function(text) {
                        var result = JSON.parse(text);
                        if (result['id']) {
                            //console.log(result);
                            var list = this.state.dbList;
                            list.push({'id': result['id'], 'key': result['id'], 'name': name , 'header': null });
                            this.addDb(result['id'],true,name);
                            this.setState({
                                dbList : list
                            },()=>{
                                DbHeaderAction['DbHeaderData'](this.state.dbList,false);
                            })
                        }
                    }.bind(this));
                }
                //私有数据库
                else if(this.props.DbType == 1){
                    WidgetActions['ajaxSend'](null, 'POST', 'app/dbSetParm', null, null, function(text) {
                        var result = JSON.parse(text);
                        if (result['id']) {
                            //console.log(result);
                            this.addDb(result['id'],false);
                        }
                    }.bind(this));
                }
            }
            else if(this.props.className === "sock"){
                let list = this.state.sockList;
                let value = "连接" + (this.state.sockList.length +1);
                WidgetActions['ajaxSend'](null, 'POST', 'app/createSock',
                    'application/x-www-form-urlencoded',
                    'name=' + encodeURIComponent(value),
                    function(text) {

                        let r = JSON.parse(text);
                        if (r['id']) {
                            list.push({'id':r['id'], 'name':value});
                            //this.updateSock(list);
                            getSockListAction['getSockList'](list);
                            WidgetActions['addWidget']('sock', {'sid': r['id']},null,value);
                            ToolBoxAction['deselect']();
                        }

                    }.bind(this));
            }
            else if(this.props.className === "module"){
                CreateModuleAction['createModule'](true);
                ToolBoxAction['deselect']();
            }
            else {
                WidgetActions['addWidget'](this.props.className, this.props.param);
                ToolBoxAction['deselect']();
            }
        }
    }

    onRightClick(event) {
        event.preventDefault();
        event.stopPropagation();
        //第一层的时候点击右键，还原所有画框并弹出第二菜单
        if(this.props.level === 1) {
            //点击的时候清除一下overlay
            new DrawRect().cleanUp();
            ToolBoxAction['selectPrimary'](this.props.cid, this.props.gid);
        }

    }

    onDrawRect() {
        this.drawRect = new DrawRect();
        this.drawRect.start();
        this.drawRect.def.promise().then(data => {
            if(this.props.param) {
                this.props.param.positionX = data.positionX;
                this.props.param.positionY = data.positionY;
                this.props.param.shapeWidth = data.shapeWidth;
                this.props.param.shapeHeight = data.shapeHeight;
                this.props.param.width = this.props.param.width?this.props.param.width:data.width;
                this.props.param.height = this.props.param.height?this.props.param.height:data.height;
            }
            if(this.props.upload||this.props.drawRectText||this.props.drawRect) {
                this.props.param.originX = 0.5;
                this.props.param.originY = 0.5;
                this.props.param.positionX += this.props.param.shapeWidth*0.5;
                this.props.param.positionY += this.props.param.shapeHeight*0.5;
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
                if(this.props.className === 'qrcode') {
                    //qrcode处理
                    this.props.param.shapeHeight = this.props.param.shapeWidth;
                }
                if(this.props.className === 'table'){
                    this.props.param.width = data.shapeWidth;
                    this.props.param.height = data.shapeHeight;
                }
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
        chooseFile(this.props.className, false, (w) => {
            if (w.files.length) {
                var self = this;
                if (self.props.className == 'image' || self.props.className == 'video') {
                    let fileName = w.files[0].name;
                    let dot = fileName.lastIndexOf('.');
                    if (dot>0) {
                        var ext = fileName.substr(dot + 1).toLowerCase();
                        if (ext == 'png' || ext == 'jpeg' || ext=='jpg') {
                            fileName = fileName.substr(0, dot);
                        }
                    }
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        self.props.param.name = fileName;
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
                                                if (count == 0) {
                                                    WidgetActions['addWidget'](self.props.className, self.props.param, list);
                                                }
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
        this.props.param.value = this.state.modal.value;
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

    addDb(id,type,name){
        if(type){
            WidgetActions['addWidget']('db', {'dbid': id }, null, name);
        }
        else {
            WidgetActions['addWidget']('db', {'dbid': id },null,"db",true);
        }
        ToolBoxAction['deselect']();
    }

    getSockList(data){
        this.setState({
            sockList : data
        })
    }

    render() {
        return (
            <button
                className={cls('ToolBoxButton',
                {'ToolBoxButtonPrimary': this.props.isPrimary},
                {'active': this.state.selected},
                {'tool-expanded':this.props.expanded},
                {'hidden': this.props.hidden})}
                title={this.props.name}
                disabled={this.props.disabled}
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
                        onOk={this.onModalOK}
                        onCancel={this.onModalCancel}>
                    <textarea className="body-textarea" value={this.state.modal.value} onChange={this.onModalTextAreaChange}>
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
