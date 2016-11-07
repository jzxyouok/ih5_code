import React from 'react';
import VxMenu from  './VxMenu';
import AccountArea from './AccountArea';
import { Button, InputNumber } from 'antd';
import { Row, Col } from 'antd';
import Cookies  from 'js-cookie';
import InputText from './InputText';
import LoginDialog from './LoginDialog';
import $ from 'jquery'
import $class from 'classnames'

import CreateModule from './create-module/index'
import ArrangeModule from './arrange-module/index'
import CreateDb from './create-db/index'
import ArrangeDb from './arrange-db/index'
import CreateSock from './create-sock/index'
import pathData from './path-data'

import bridge from 'bridge';
const PREFIX = 'app/';
import WidgetActions from '../actions/WidgetActions';
import WidgetStore, {nodeType} from '../stores/WidgetStore';
import DbHeaderAction from '../actions/DbHeader'
import DbHeaderStores from '../stores/DbHeader';
import DrawRect from './ToolBox/DrawRect';
import {checkChildClass} from './PropertyMap';
import getSockListAction from '../actions/getSockListAction';
import getSockListStore from '../stores/getSockListStore';
import ReDbOrSockIdStore from '../stores/ReDbOrSockIdStore';
import CreateModuleStore from '../stores/CreateModuleStore';



const orderType = [
    {name: '左对齐', className: 'left-icon', type:1},
    {name: '左右居中', className: 'zhong-icon', type:2},
    {name: '右对齐', className: 'right-icon', type:3},
    {name: '底部对齐', className: 'top-icon', type:4},
    {name: '上下居中', className: 'middle-icon', type:5},
    {name: '顶部对齐', className: 'bottom-icon', type:6},
];

const distributeType = [
    {name: '水平分布', className: 'stretch-icon', type:1},
    {name: '垂直分布', className: 'vertical-icon', type:2},
];

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: null,
            workname: null,
            importname: null,
            saveVisible: false,
            importVisible: false,
            workList:[],
            classList:[],
            fontList:[],
            dropDownState : 0,
            createClass : false,
            arrangeModule : false,
            dbList : [],
            createDb : false,
            selectWidget : null,
            selectFadeWidgetKey: null,
            nodeType: nodeType.widget,
            arrangeDb : false,
            zoomInputState: 0,
            sockList : [],
            createSock : false,
            shapeList : pathData,
            isAddShape : true,
            workShow : false,
            specialLayer : false,
            openWork : false,
            isAddDb : true,
            isAddSock : true,
            reAddDbId : [],
            reAddSockId : [],
            addPanel : false,
            saveWNError : null,
            saveWDError : null,
            saveLoading : false,
            saveFinish : false,
            saveFinishPlay : false,
            qrCodeType : false,
            qrCodeShow : false,
            qrCode : null,
            createWork : false,
            loading : 0,
            saveError : false,
            historyRW : 1,
            historyRecord : [],
            historyNameList : ["初始化"],
            historyShow : false,
            historyLayerHide : false,
            isShowRulerLine:true,
            activeKey: null,
            selectWidgets: []
        };

        this.onLogout = this.onLogout.bind(this);
        this.onOpen = this.onOpen.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onHideRulerLine=this.onHideRulerLine.bind(this);
        this.onPlay = this.onPlay.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.saveCallback = this.saveCallback.bind(this);
        this.onImport = this.onImport.bind(this);
        this.dropDownShow = this.dropDownShow.bind(this);
        this.clickOthersHide = this.clickOthersHide.bind(this);
        this.createClassBtn = this.createClassBtn.bind(this);
        this.closeClassBtn = this.closeClassBtn.bind(this);
        this.addClass = this.addClass.bind(this);
        this.arrangeModuleBtn = this.arrangeModuleBtn.bind(this);
        this.closeArrangeModuleBtn = this.closeArrangeModuleBtn.bind(this);
        this.createDbShow = this.createDbShow.bind(this);
        this.createDbHide = this.createDbHide.bind(this);
        this.onUpdateDb = this.onUpdateDb.bind(this);
        this.addDb = this.addDb.bind(this);
        this.arrangeDbShow = this.arrangeDbShow.bind(this);
        this.arrangeDbHide = this.arrangeDbHide.bind(this);
        this.sendDbData = this.sendDbData.bind(this);
        this.focusOrBlurZoomInput = this.focusOrBlurZoomInput.bind(this);
        this.createSockShow = this.createSockShow.bind(this);
        this.createSockHide = this.createSockHide.bind(this);
        //this.updateSock = this.updateSock.bind(this);
        this.addSock = this.addSock.bind(this);
        this.onDrawRect = this.onDrawRect.bind(this);
        this.openWorkShow = this.openWorkShow.bind(this);
        this.openWorkHide = this.openWorkHide.bind(this);
        this.specialLayerToogle = this.specialLayerToogle.bind(this);
        this.clickOthersHide1 = this.clickOthersHide1.bind(this);
        this.addPanelShow = this.addPanelShow.bind(this);
        this.addPanelHide = this.addPanelHide.bind(this);
        this.cancelSave = this.cancelSave.bind(this);
        this.onSaveDone = this.onSaveDone.bind(this);
        this.saveFinishFuc = this.saveFinishFuc.bind(this);
        this.qrCode = this.qrCode.bind(this);
        this.qrCodeClose = this.qrCodeClose.bind(this);
        this.createWorkShow = this.createWorkShow.bind(this);
        this.createWorkHide = this.createWorkHide.bind(this);
        this.createWork = this.createWork.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.getWorks = this.getWorks.bind(this);
        this.revokedHistory = this.revokedHistory.bind(this);
        this.replyHistory = this.replyHistory.bind(this);
        this.chooseHistory = this.chooseHistory.bind(this);
        this.historyLayerHide = this.historyLayerHide.bind(this);
        this.historyShow = this.historyShow.bind(this);
        this.onEvent = this.onEvent.bind(this);

        this.onKeyHistory = this.onKeyHistory.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);


        this.onClickAlignWidgets = this.onClickAlignWidgets.bind(this);
        this.onClickDistributeWidgets = this.onClickDistributeWidgets.bind(this);

        this.token = null;
        this.playUrl = null;
        this.fileUrl = null;
        this.isPlay = null;

        var name = Cookies.get('ih5token');
        //console.log(name);
        if (name) {
            this.state.loginVisible = false;
            this.getWorks(name);
        } else {
            this.state.loginVisible = true;
            //window.open("http://test-beta.ih5.cn", "_self")
        }
        this.newWork();
        this.workid = null;
        this.workNid = null;
        this.drawRect = null;
        this.closeTimeFuc = null;
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
        this.onStatusChange(WidgetStore.getStore());
        DbHeaderStores.listen(this.DbHeaderData.bind(this));
        getSockListStore.listen(this.getSockList.bind(this));
        ReDbOrSockIdStore.listen(this.reDbOrSockId.bind(this));
        CreateModuleStore.listen(this.createModule.bind(this));
        document.body.addEventListener('keyup', this.onKeyHistory);
        document.body.addEventListener('keydown', this.onKeyDown);

        window.onbeforeunload = ()=>{
            var n = window.event.screenX - window.screenLeft;
            //鼠标在当前窗口内时，n<m，b为false；鼠标在当前窗口外时，n>m，b为true。20这个值是指关闭按钮的宽度
            var b = n > document.documentElement.scrollWidth-20;
            //鼠标在客户区内时，window.event.clientY>0；鼠标在客户区外时，window.event.clientY<0
            if(b && window.event.clientY < 0 || window.event.altKey){
                //这是一个关闭操作而非刷新
                return false;
            }else{
                //这是一个刷新操作而非关闭
                return false;
            }
        };


        let pathName = window.location.search;
        if(pathName.substr(0,5) == "?nid="){
            let reg = /\D/;
            let str= pathName.substr(5,pathName.length);
            let index = reg.exec(str);
            let nid;
            if(index == null){
                nid = str;
            }
            else {
                nid = pathName.substr(5,index.index);
            }
            //console.log(nid);
            this.workNid = nid;
            this.onImportUrl(PREFIX + 'work/', nid);
        }
        else{
            this.workid = null;
            this.workNid = null;
            localStorage.setItem("workID", null );
            this.onSave();
            //let id = localStorage.getItem("workID");
            //if(id !== null){
            //    this.onImportUrl(PREFIX + 'work/' + id, id);
            //    this.workid = id;
            //    localStorage.setItem("workID", id );
            //}
        }
        WidgetActions['cleanHistory']();
    }

    componentWillUnmount() {
        this.unsubscribe();
        clearTimeout(this.closeTimeFuc());
        localStorage.setItem("workID", null);
        document.body.removeEventListener('keyup', this.onKeyHistory);
        document.body.removeEventListener('keydown', this.onKeyDown);

    }

    onStatusChange(widget) {
        //console.log(widget);
        if (widget.classList !== undefined) {
            this.setState({
                classList: widget.classList
            });
        }
        if(widget.selectWidget){
            this.setState({
                selectWidget : widget.selectWidget,
                nodeType: nodeType.widget,
                isAddShape : checkChildClass(widget.selectWidget, 'path'),
                selectWidgets: []
            });
            if(widget.selectWidget.className == "root"){
                let data = widget.selectWidget.children;
                let reAddDbId = [];
                let reAddSockId = [];
                if(data.length > 0){
                    data.map((v,i)=>{
                        if(v.className == "db"){
                            if(v.node.dbType == "shareDb"){
                                reAddDbId.push(v.node.dbid)
                            }
                        }
                        if(v.className == "sock"){
                            reAddSockId.push(v.node.sid)
                        }
                    })
                }
                this.setState({
                    isAddDb : true,
                    isAddSock : true,
                    reAddDbId : reAddDbId,
                    reAddSockId : reAddSockId
                })
            }
            else {
                this.setState({
                    isAddDb : false,
                    isAddSock : false
                })
            }
        } else if (widget.selectFunction) {
            this.setState({
                selectFadeWidgetKey: widget.selectFunction.key,
                nodeType: nodeType.func,
                selectWidgets: []
            });
        } else if (widget.selectVariable) {
            this.setState({
                selectFadeWidgetKey: widget.selectVariable.key,
                nodeType: nodeType.var,
                selectWidgets: []
            });
        } else if (widget.selectDBItem) {
            this.setState({
                selectFadeWidgetKey: widget.selectDBItem.key,
                nodeType: nodeType.dbItem,
                selectWidgets: []
            });
        } else if(widget.activeEventTreeKey) {
            this.setState({
                activeKey: widget.activeEventTreeKey.key
            });
        } else if(widget.selectWidgets) {
            this.setState({
                selectWidgets: widget.selectWidgets
            })
        }
        if(widget.historyRW){
            this.setState({
                historyRW : widget.historyRW
            })
        }
        if(widget.historyRecord){
            this.setState({
                historyRecord : widget.historyRecord
            })
        }
        if(widget.historyNameList){
            this.setState({
                historyNameList : widget.historyNameList
            })
        }
        if(widget.historyPropertiesUpdate){
            this.forceUpdate();
        }
        if(widget.setRulerLineBtn){
            this.onHideRulerLine();
        }
    }

    newWork() {
        this.workid = null;
        WidgetActions['initTree']({'stage':{'cls': 'root', 'props': {'width': 640, 'height': 1040, 'color':'#FFFFFF', 'direction':'column'}, links:[]}});
    }

    getWorks(token) {
        WidgetActions['ajaxSend'](token, 'GET', PREFIX + 'userInfo', null, null, function(text) {
            let result = JSON.parse(text);
            if (result['name']) {
                this.playUrl = result['playUrl'];
                this.fileUrl = result['fileUrl'];
                bridge.setFilePath(this.fileUrl + 'files/');
                this.setState({
                    loginVisible: false,
                    username: result['name'],
                    workList: result['list'].reverse(),
                    fontList: result['font'],
                    dbList: result['db'],
                    sockList: result['sock']
                });
                DbHeaderAction['DbHeaderData'](result['db'],false);
                WidgetActions['saveFontList'](result['font']);
                getSockListAction['getSockList'](result['sock']);

                result['list'].map((v,i)=>{
                    if(v.nid == this.workNid){
                        this.workid = v.id ;
                        localStorage.setItem("workID", v.id );
                    }
                });
            } else {
                this.setState({loginVisible: true});
            }
        }.bind(this));
    }

    sendDbData(){
        DbHeaderAction['DbHeaderData'](this.state.dbList,true);
    }

    DbHeaderData(data,bool){
        //console.log(45646,data);
        this.setState({
            dbList : data
        })
    }

    login(name, pass) {
        WidgetActions['ajaxSend'](null, 'POST', PREFIX + 'login',
            'application/x-www-form-urlencoded', 'username=' + encodeURIComponent(name) + '&password=' + encodeURIComponent(pass),
            function(text) {
                let r = JSON.parse(text);
                if (r['token']) {
                    Cookies.set('ih5token', r['token'], { expires: 30 });
                    getWorks(r['token']);
                } else {
                    this.setState({loginVisible: true});
                }
            }.bind(this));
    }

    saveCallback(id, wname, wdescribe,nid) {
        if (wname != null) {
            let result = [{'id': id, 'name': wname , 'describe':wdescribe}, ...this.state.workList];
            this.setState({
                workList: result
            });
        }
        let pathName = window.location.search;
        if(this.workid == null && pathName.substr(0,5) != "?nid="){
            let workNid = "?nid=" + nid;
            let href = window.location.href;
            let index = href.indexOf('?');
            if(index>=0){
                href = href.substring(0,index);
            }
            if(pathName.substr(0,6) == '?dom=1'){
                window.open(href + workNid + '?dom=1', "_self");
            }
            else {
                window.open(href + workNid, "_self");
            }
        }

        this.workid = id;
        localStorage.setItem("workID", id);

        this.closeTimeFuc =()=>{
            setTimeout(()=>{
                this.setState({
                    saveFinish : false
                });
            },1000);
        };

        if (this.isPlay) {
            this.setState({
                saveLoading : false,
                saveFinishPlay : true,
                saveError :　false
            });
            //window.open(this.playUrl + 'work/' + id, '_blank');
        }
        else if(this.state.qrCodeType){
            let qrCode = bridge.generateQrcode(this.playUrl+ 'work/' + id, 174, 174);
            //console.log(qrCode);
            this.setState({
                saveLoading : false,
                qrCodeShow : true,
                qrCode : qrCode,
                saveError :　false
            });
        }
        else {
            this.setState({
                saveLoading : false,
                saveFinish : true,
                saveError :　false
            },()=>{
                this.closeTimeFuc();
            });
        }
    }

    saveFinishFuc(){
        let isPlay = this.isPlay;
        if(!this.state.saveError){
            if(isPlay){
                window.open(this.playUrl + 'work/' + this.workid,  '_blank');
            }
            else {
                clearTimeout(this.closeTimeFuc());
            }
        }
        this.setState({
            saveFinish : false,
            saveFinishPlay : false,
            saveError :　false
        });
    }

    createWork(bool){
        this.setState({
            specialLayer : false
        });
        if(bool){
            let href = window.location.href;
            let index = href.indexOf('?');
            if(index>=0){
                href = href.substring(0,index);
            }
            window.open(href + "?dom=1", "_self");
            this.workid = null;
            localStorage.setItem("workID", null);
        }
        else{
            let href = window.location.href;
            let index = href.indexOf('?');
            if(index>=0){
                href = href.substring(0,index);
            }
            localStorage.setItem("workID", null);
            window.open(href, "_self");
        }
    }

    onPlaySave(isPlay) {
        this.isPlay = isPlay;
        if (this.workid) {
            this.cancelSave();
            this.setState({
                loading : 0,
                saveLoading : true
            });
            //console.log(this.workid);
            localStorage.setItem("workID", this.workid);
            WidgetActions['saveNode'](this.workid, null, null, this.saveCallback,this.updateProgress);
        } else {
            this.setState({saveVisible: true});
        }
    }

    cancelSave(){
        this.setState({
            saveVisible: false,
            saveWNError : null,
            saveWDError : null
        });
        this.refs.saveWorkDescribe.value = "";
        this.refs.saveWorkName.value = "";
    }

    onSave() {
        this.onPlaySave(false);
        this.setState({
            specialLayer : false,
            qrCodeType : false
        })
    }

    onEvent(){
        if(this.state.activeKey) {
            WidgetActions['activeEventTree'](null);
        } else {
            switch (this.state.nodeType) {
                case nodeType.widget:
                    if(this.state.selectWidget.key !== this.state.activeKey){
                        WidgetActions['activeEventTree'](this.state.selectWidget.key);
                    }
                    break;
                case nodeType.func:
                case nodeType.dbItem:
                case nodeType.var:
                    if(this.state.selectFadeWidgetKey !== this.state.activeKey){
                        WidgetActions['activeEventTree'](this.state.selectFadeWidgetKey);
                    }
                    break;
                default:
                    break;
            }
        }

    }

    qrCode() {
        this.onPlaySave(false);
        this.setState({
            specialLayer : false,
            qrCodeType : true,
            qrCode : null
        })
    }

    qrCodeClose(){
        this.setState({
            qrCodeType : false,
            qrCodeShow : false,
            qrCode : null
        })
    }

    onPlay() {
        this.onPlaySave(true);
        this.setState({
            specialLayer : false,
            qrCodeType : false
        })
    }

    onHideRulerLine(){
        let bool =!this.state.isShowRulerLine;
        this.refs.isShowRulerLine.title=!bool?'显示参考线':'隐藏参考线';
        WidgetActions['setRulerLine'](bool) ;
        this.setState({isShowRulerLine:bool});
    }

    onImport() {
        this.setState({importVisible: true});
    }

    onDelete() {
        if (this.workid) {
            WidgetActions['ajaxSend'](null, 'DELETE', PREFIX + 'work/' + this.workid, null, null, function() {
                let result = [];
                for (var i = 0; i < this.state.workList.length; i++) {
                    if (this.state.workList[i]['id'] != this.workid) {
                        result.push(this.state.workList[i]);
                    }
                }
                this.workid = null;
                this.setState({workList: result});
            }.bind(this));
        }
    }

    onLogout() {
        Cookies.remove('ih5token');
        this.setState({loginVisible: true, username: null});
    }

    onOpen(id) {
        let nid = "?nid=" + id;
        let href = window.location.href;
        let index = href.indexOf('?');
        if(index>=0){
            href = href.substring(0,index);
        }
        window.open(href + nid, "_self");

        //this.onImportUrl(PREFIX + 'work/' + id, id);
        //this.setState({
        //    specialLayer : false,
        //    reAddDbId : [],
        //    reAddSockId : []
        //})
    }

    onImportUrl(url, id) {
        WidgetActions['ajaxSend'](null, 'GET', url + 'iH5Tool?raw=1&nid=' + id, null, null, function(text) {
            bridge.decryptData(text, function(result) {
                if (result && result['stage']) {
                    WidgetActions['initTree'](result);
                    WidgetActions['cleanHistory']();
                }
            }.bind(this));
        }.bind(this), true);
    }

    onLoginDone(name, pass) {
        if (name) {
            this.login(name, pass);
            this.setState({loginVisible: false, username:name});
        }
    }

    onSaveDone() {
        let name = this.refs.saveWorkName.value;
        let describe = this.refs.saveWorkDescribe.value.length >0 ? this.refs.saveWorkDescribe.value : "ih5测试案例";
        //console.log(name,describe);
        if(name.length == 0){
            this.setState({
                saveWNError : "作品名字不能为空"
            })
        }
        else if(name.startsWith(" ")){
            this.setState({
                saveWNError : "作品名字不能以空格开头"
            })
        }
        else if(describe.length < 5){
            this.setState({
                saveWNError : null,
                saveWDError : "作品描述至少5个字符"
            })
        }
        else {
            this.cancelSave();
            this.setState({
                loading : 0,
                saveLoading : true
            });
            WidgetActions['saveNode'](null, name, describe, this.saveCallback,this.updateProgress);
        }
        //this.setState({saveVisible: false});
        //if (s)
        //    WidgetActions['saveNode'](null, s, this.saveCallback);
    }

    updateProgress(e){
        //console.log(e);
        if(e.lengthComputable) {
            let percentComplete = e.loaded / e.total * 100;
            this.setState({
                loading : percentComplete + '%'
            })
        }
        else {
            this.closeTimeFuc =()=>{
                setTimeout(()=>{
                    this.setState({
                        saveFinish : false
                    });
                },1000);
            };
            if (this.isPlay) {
                this.setState({
                    saveLoading : false,
                    saveFinishPlay : true,
                    saveError : true
                });
            }
            else {
                this.setState({
                    saveLoading : false,
                    saveFinish : true,
                    saveError : true
                },()=>{
                    this.closeTimeFuc();
                });
            }
        }
    }

    onImportDone(s) {
        this.setState({importVisible: false});
        if (s)
            this.onImportUrl(s, null);
    }

    onUploadChange(s) {
        s.target.sysCallback(s.target);
    }

    onUploadFont(text) {
        var s = JSON.parse(text);
        var fontList = this.state.fontList;
        fontList.push(s);
        this.setState({fontList:fontList});
    }

    dropDownShow(num){
        this.setState({
            dropDownState : num
        },()=>{
            this.clickOthersHide();
        });
    }

    clickOthersHide(){
        let self = this;
        let fuc = function(e){
            let _con1 = $('.dropDownToggle');   // 设置目标区域
            let _con2 = $('.dropDownBtn');
            if(
                (!_con1.is(e.target) && _con1.has(e.target).length === 0)
                &&(!_con2.is(e.target) && _con2.has(e.target).length === 0)
            ){
                self.setState({
                    dropDownState : 0
                },()=>{
                    $(document).off('mouseup', fuc);
                })
            }
        };
        if(this.state.dropDownState !== 0){
            $(document).on('mouseup', fuc);
        }
        else {
            $(document).off('mouseup', fuc);
        }
    }

    createClassBtn(){
        this.setState({
            createClass : true
        })
    }

    closeClassBtn(){
        this.setState({
            createClass : false
        })
    }

    addClass(name){
        //console.log(key);
        WidgetActions['addWidget'](name);
    }

    arrangeModuleBtn(){
        this.setState({
            arrangeModule : true
        })
    }

    closeArrangeModuleBtn(){
        this.setState({
            arrangeModule : false
        })
    }

    createDbShow(){
        let name = '数据库' + (this.state.dbList.length + 1);
        let data = "name=" + encodeURIComponent(name) + "&header=" +  null;
        //console.log(data);
        WidgetActions['ajaxSend'](null, 'POST', PREFIX + 'dbSetParm?' + data, null, null, function(text) {
            var result = JSON.parse(text);
            if (result['id']) {
                //console.log(result);
                var list = this.state.dbList;
                list.push({'id': result['id'], 'key': result['id'], 'name': name , 'header': null });
                //WidgetActions['addWidget']('db', {'dbid': result['id'] }, null, name);
                this.addDb(result['id'],name);
                this.setState({
                    dbList : list
                },()=>{
                    DbHeaderAction['DbHeaderData'](this.state.dbList,false);
                })
            }
        }.bind(this));
        //this.setState({
        //    createDb : true
        //})
        //this.addPanelHide();
    }

    createDbHide(){
        this.setState({
            createDb : false
        })
    }

    onUpdateDb(list) {
        this.setState({'dbList': list});
    }

    addDb(id,name){
        if(this.state.selectWidget.className == "root" && this.state.selectWidget.props.name == "stage"){
            let bool = true;
            let data = this.state.selectWidget.children;
            for(let i =0 ; i<data.length; i++){
                if(data[i].className == "db"){
                    if(data[i].node.dbid == id){
                        bool = false;
                        return bool;
                    }
                }
            }
            if(bool){
                WidgetActions['addWidget']('db', {'dbid': id }, null, name);
                let reAddDbId = this.state.reAddDbId;
                reAddDbId.push(id);
                this.setState({
                    reAddDbId : reAddDbId
                });
                this.addPanelHide();
            }
        }
    }

    arrangeDbShow(){
        this.setState({
            arrangeDb : true
        })
    }

    arrangeDbHide(){
        this.setState({
            arrangeDb : false
        })
    }

    focusOrBlurZoomInput(e) {
        let currentState = 0;
        if (e.type == 'focus') {
            currentState = 1;
        }
        this.setState({
            zoomInputState: currentState
        });
    }

    createSockShow(){
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
                    this.addSock(r['id'],value);
                    getSockListAction['getSockList'](list);
                }

            }.bind(this));

        //this.setState({
        //    createSock : true
        //})
        //this.addPanelHide();
    }

    createSockHide(){
        this.setState({
            createSock : false
        })
    }

    //updateSock(data){
    //    this.setState({
    //        sockList : data
    //    })
    //}

    getSockList(data){
        this.setState({
            sockList : data
        })
    }

    addSock(id,name){
        if(this.state.selectWidget.className == "root" && this.state.selectWidget.props.name == "stage"){
            let bool = true;
            let data = this.state.selectWidget.children;
            for(let i =0 ; i<data.length; i++){
                if(data[i].className == "sock"){
                    if(data[i].node.sid == id){
                        bool = false;
                        return bool;
                    }
                }
            }
            if(bool){
                WidgetActions['addWidget']('sock', {'sid': id},null,name);
                let reAddSockId = this.state.reAddSockId;
                reAddSockId.push(id);
                this.setState({
                    reAddSockId : reAddSockId
                });
                this.addPanelHide();
            }
        }
    }

    onDrawRect(svgPath) {
        if(!this.state.isAddShape) return;

        new DrawRect().cleanUp();
        this.drawRect = new DrawRect();
        this.drawRect.start();
        let svgData = {
            positionX : undefined,
            positionY : undefined,
            shapeWidth : undefined,
            shapeHeight : undefined,
            viewBoxWidth : 100,
            viewBoxHeight : 100,
            'fillColor':'#3899ec',
            path : svgPath
        };

        this.drawRect.def.promise().then(data => {
            svgData.positionX = data.positionX;
            svgData.positionY = data.positionY;
            svgData.shapeWidth = data.shapeWidth;
            svgData.shapeHeight = data.shapeHeight;
            //svgData.width = data.width;
            //svgData.height = data.height;

            //console.log(svgData);
            WidgetActions['addWidget']("path", svgData);
            this.drawRect.end();
            this.drawRect.cleanUp();
            this.drawRect = null;
        },(() => {
            this.drawRect.end();
            this.drawRect.cleanUp();
            this.drawRect = null;
        }));
    }

    openWorkShow(){
        this.setState({
            openWork : true
        })
    }

    openWorkHide(){
        this.setState({
            openWork : false
        })
    }

    createWorkShow(){
        this.setState({
            createWork : true
        })
    }

    createWorkHide(){
        this.setState({
            createWork : false
        })
    }

    specialLayerToogle(){
        this.setState({
            specialLayer : !this.state.specialLayer
        },()=>{
            if(this.state.specialLayer){
                this.clickOthersHide1();
            }
        })
    }

    clickOthersHide1(){
        let self = this;
        let fuc = function(e){
            let _con = $('.special-layer');   // 设置目标区域
            if(
                (!_con.is(e.target) && _con.has(e.target).length === 0)
            ){
                self.setState({
                    specialLayer : false
                },()=>{
                    $(document).off("mouseup", fuc);
                })
            }
        };
        if(this.state.whichdropdown !== -1){
            $(document).on("mouseup", fuc);
        }
        else {
            $(document).off("mouseup", fuc);
        }
    }

    reDbOrSockId(type,id){
        if(type == "db"){
            let reAddDbId = this.state.reAddDbId;
            let index = reAddDbId.indexOf(id);
            if(index >= 0){
                reAddDbId.splice(index , 1);
                this.setState({
                    reAddDbId : reAddDbId
                })
            }
        }
        else if(type == "sock"){
            let reAddSockId = this.state.reAddSockId;
            let index = reAddSockId.indexOf(id);
            if(index >= 0){
                reAddSockId.splice(index , 1);
                this.setState({
                    reAddSockId : reAddSockId
                })
            }
        }
    }

    addPanelShow(){
        this.setState({
            addPanel: true
        })
    }

    addPanelHide(){
        //console.log(1);
        this.setState({
            addPanel: false
        })
    }

    createModule(bool){
        if(bool){
            this.createClassBtn();
        }
    }

    revokedHistory(){
        if(this.state.historyRW > 1){
            WidgetActions['revokedHistory']();
        }
    }
    replyHistory(){
        if(this.state.historyRW < this.state.historyRecord.length){
            WidgetActions['replyHistory']();
        }
    }
    chooseHistory(num){
        WidgetActions['chooseHistory'](num);
    }

    historyShow(){
        this.setState({
            historyShow : !this.state.historyShow,
            historyLayerHide : false
        })
    }

    historyLayerHide(){
        this.setState({
            historyLayerHide : !this.state.historyLayerHide
        })
    }
    onKeyDown(event){

        if(event.target.nodeName==='INPUT' || event.target.nodeName==='TEXTAREA') {
            window.macKeys.reset();
            return;
        }

        let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        let didPressCtrl = (isMac && window.macKeys.cmdKey) || (!isMac && event.ctrlKey);
        //Ctrl+s
        if (didPressCtrl && event.keyCode == 83) {
            event.preventDefault();
            this.onSave();
            window.macKeys.reset();
        }

    }


    onKeyHistory(event) {
        if(event.target.nodeName==='INPUT' || event.target.nodeName==='TEXTAREA') {
            window.macKeys.reset();
            return;
        }

        let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        let didPressCtrl = (isMac && window.macKeys.cmdKey) || (!isMac && event.ctrlKey);

        //Ctrl+Z
        if (didPressCtrl && event.keyCode == 90) {
            event.stopPropagation();
          //console.log('Ctrl+Z');
            this.revokedHistory();
            window.macKeys.reset();
        }
        //Ctrl+y
        if (didPressCtrl && event.keyCode == 89) {
            event.stopPropagation();
            //console.log('Ctrl+y');
            this.replyHistory();
            window.macKeys.reset();
        }

    }

    onClickAlignWidgets(type, e) {
        if(this.state.selectWidgets.length<2) {
            return;
        }
        this.setState({
            dropDownState : 0
        },()=>{
            WidgetActions['alignWidgets'](type, 'align');
        })
    }

    onClickDistributeWidgets(type, e) {
        if(this.state.selectWidgets.length<3) {
            return;
        }
        this.setState({
            dropDownState : 0
        },()=>{
            WidgetActions['alignWidgets'](type, 'distribute');
        })
    }

    render() {
        //console.log(this.state.workList);
        let moduleFuc = (num, min)=>{
            let a = min - num;
            let fuc = [];
            if(a >= 0){
                for(let index = 0; index < a; index++){
                    fuc[index] = index;
                }
            }
            if(a < 0){
                let b = (num + 1) % 3;
                if(3-b == 0){
                    return;
                }
                else{
                    for(let index = 0; index < 3-b; index++){
                        fuc[index] = index;
                    }
                }
            }
            return fuc.map((v,i)=>{
                return <li key={i} className="not-active"> </li>
            })
        };

        return (
            <div>
                <div className='NavBar f--h'>
                    <div className='nb--left f--h'>
                        <div className='import' onClick={ this.specialLayerToogle }>
                            <span className='icon' />
                        </div>

                        <div className={$class("special-layer",{"hidden": !this.state.specialLayer})}
                             style={{ left : this.props.expanded? '64px':'36px'}}>
                            <ul className="special-list">
                                <li className="f--hlc create-li"
                                    onMouseOver={ this.createWorkShow }
                                    onMouseOut={ this.createWorkHide }>
                                    新建作品
                                    <span className="icon" />
                                </li>
                                <li className="f--hlc open-li"
                                    onMouseOver={ this.openWorkShow }
                                    onMouseOut={ this.openWorkHide }>

                                    最近打开
                                    <span className="icon" />
                                </li>
                                <li className="line" />
                                <li className="save-li" onClick={this.onSave} >保存</li>
                                <li>另存为</li>
                                <li className="line" />
                                <li>导入PSD</li>
                                <li>我的字体库</li>
                            </ul>

                            <div className={ $class("open-li-content",{"hidden": !this.state.openWork})}
                                 onMouseOver={ this.openWorkShow }
                                 onMouseOut={ this.openWorkHide }>
                                <ul>
                                    {
                                        this.state.workList.length === 0
                                            ? <li>你还没创建文件!</li>
                                            : this.state.workList.map((v,i)=>{
                                            return  <li key={i}
                                                        className={$class({'hidden': i >= 10})}
                                                        onClick={ this.onOpen.bind(this, v.nid)}>
                                                { i >= 10 ? null : v.name}
                                            </li>
                                        })
                                    }
                                </ul>
                            </div>

                            <div className={ $class("create-li-content",{"hidden": !this.state.createWork})}
                                 onMouseOver={ this.createWorkShow }
                                 onMouseOut={ this.createWorkHide }>
                                <ul>
                                    <li onClick={ this.createWork.bind(this,true) }>网页</li>
                                    <li onClick={ this.createWork.bind(this,false) }>画布</li>
                                </ul>
                            </div>
                        </div>

                        <div className='left-group f--hlc'>
                            <button className='btn btn-clear save-btn' title='保存' onClick={this.onSave} >
                                <span className="icon" />
                                <span className="title">保存</span>
                            </button>

                            <button className='btn btn-clear template-btn' title='事件' onClick={this.onEvent}>
                                <span className="icon" />
                                <span className="title">事件</span>
                            </button>

                            <div className='dropDown-btn module-dropDown f--hlc'>
                                <button className='btn btn-clear module-btn' title='组件'>
                                    <span className="icon" />
                                    <span className="title">组件</span>
                                </button>

                                <div className='dropDownToggle'>
                                    <div className="dropDownToggle-main">
                                        <div className="dropDown-title f--hlc">
                                            <span className="flex-1">全部组件：</span>
                                            <span className="set-btn" onClick={ this.arrangeModuleBtn } />
                                        </div>

                                        <div className="dropDown-main">
                                            <div className="dropDown-scroll">
                                                <ul className="dropDown-content">
                                                    {
                                                        this.state.classList.length > 0
                                                        ? this.state.classList.map((v,i)=>{
                                                            let name = "_" + v;
                                                            return  <li className="f--hlc" key={i}>
                                                                        <div className="flex-1 f--hlc title" onClick={ this.addClass.bind(this, name) }>
                                                                            <span className="li-icon" />
                                                                            <div className="TitleName">{v}</div>
                                                                        </div>

                                                                        <span className="edit-btn" />
                                                                    </li>
                                                          })
                                                        : null
                                                    }
                                                    <li className="add-btn f--hcc" onClick={ this.createClassBtn }>
                                                        <div className="icon">
                                                            <span className="heng" />
                                                            <span className="shu" />
                                                        </div>
                                                    </li>
                                                    {
                                                        moduleFuc(this.state.classList.length, 14)
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='dropDown-btn db-dropDown f--hlc'>
                                <button className='btn btn-clear data-btn' title='数据库' style={{ width : "70px" }} onMouseOver={ this.addPanelShow }>
                                    <span className="icon" />
                                    <span className="title">数据库</span>
                                </button>

                                <div className={$class('dropDownToggle',{"hidden": !this.state.addPanel})}>
                                    <div className="dropDownToggle-main">
                                        <div className="dropDown-title f--hlc">
                                            <span className="flex-1">全部数据库：</span>
                                            <span className="set-btn" onClick={ this.arrangeDbShow } />
                                        </div>

                                        <div className="dropDown-main">
                                            <div className="dropDown-scroll">
                                                <ul className="dropDown-content">
                                                    {
                                                        this.state.dbList.length > 0
                                                            ? this.state.dbList.map((v,i)=>{
                                                                return  <li className={$class({"not-active" : !this.state.isAddDb
                                                                              || (this.state.isAddDb && this.state.reAddDbId.indexOf(v.id)>= 0)
                                                                                            })}
                                                                            key={i} >

                                                                            <div className="title" onClick={this.addDb.bind(this,v.id,v.name)}>
                                                                                <span className="li-icon" />
                                                                                <div className="TitleName">{ v.name }</div>
                                                                            </div>

                                                                            {
                                                                                //<span className="edit-btn" />
                                                                            }
                                                                        </li>
                                                              })
                                                            : null
                                                    }
                                                    <li className="add-btn f--hcc" onClick={ this.createDbShow }>
                                                        <div className="icon">
                                                            <span className="heng" />
                                                            <span className="shu" />
                                                        </div>
                                                    </li>
                                                    {
                                                        moduleFuc(this.state.dbList.length, 11)
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='dropDown-btn link-dropDown f--hlc'>
                                <button className='btn btn-clear link-btn' title='连接' onMouseOver={ this.addPanelShow }>
                                    <span className="icon" />
                                    <span className="title">连接</span>
                                </button>

                                <div className={$class('dropDownToggle',{"hidden": !this.state.addPanel})}>
                                    <div className="dropDownToggle-main">
                                        <div className="dropDown-title f--hlc">
                                            <span className="flex-1">全部连接：</span>
                                            <span className="set-btn hidden" />
                                        </div>

                                        <div className="dropDown-main">
                                            <div className="dropDown-scroll">
                                                <ul className="dropDown-content">
                                                    {
                                                        this.state.sockList.length > 0
                                                            ? this.state.sockList.map((v,i)=>{
                                                                return  <li className={$class({"not-active" : !this.state.isAddSock
                                                                            || (this.state.isAddSock && this.state.reAddSockId.indexOf(v.id)>= 0)
                                                                                            })}
                                                                            key={i}
                                                                            onClick={this.addSock.bind(this,v.id,v.name)}>
                                                                            <div className="title f--hlc">
                                                                                <span className="li-icon" />
                                                                                <div className="TitleName">{ v.name }</div>
                                                                            </div>
                                                                        </li>
                                                              })
                                                            : null
                                                    }
                                                    <li className="add-btn f--hcc" onClick={ this.createSockShow }>
                                                        <div className="icon">
                                                            <span className="heng" />
                                                            <span className="shu" />
                                                        </div>
                                                    </li>
                                                    {
                                                        moduleFuc(this.state.sockList.length, 14)
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='dropDown-btn shape-dropDown f--hlc'>
                                <button className='btn btn-clear shape-btn' title='形状'>
                                    <span className="icon" />
                                    <span className="title">形状</span>
                                </button>

                                <div className='dropDownToggle'>
                                    <div className="dropDownToggle-main">
                                        <div className="dropDown-title f--hlc">
                                            <span className="flex-1">全部形状：</span>
                                        </div>

                                        <div className="dropDown-main">
                                            <div className="dropDown-scroll">
                                                <ul className="dropDown-content">
                                                    {
                                                        this.state.shapeList.data.length > 0
                                                            ? this.state.shapeList.data.map((v,i)=>{
                                                                return  <li className={ $class({"not-active": !this.state.isAddShape})}
                                                                            key={i}
                                                                            title={v.name}
                                                                            onClick={ this.onDrawRect.bind(this,v.path) }>

                                                                            <svg id={v.name}
                                                                                 data-name={v.name}
                                                                                 xmlns="http://www.w3.org/2000/svg"
                                                                                 width="100"
                                                                                 height="100"
                                                                                 viewBox="0 0 100 100">

                                                                                 <path d={ v.path } style={{fill: "#b5b5b5", fillRule: "evenodd"}} />
                                                                            </svg>
                                                                        </li>
                                                            })
                                                            : null
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='nb--content flex-1 f--hcc f--hlc'>
                        <div className="damndesigner f--hcc f--hlc">
                            <button className='btn btn-clear preview-btn' title='预览' onClick={this.onPlay} >
                                <span className='icon' />
                                预览
                            </button>

                            <button className='btn btn-clear qrCode-btn' title='二维码' onClick={ this.qrCode }>
                                <span className='icon' />
                                二维码
                            </button>

                            <button className='btn btn-clear release-btn' title='发布' >
                                <span className='icon' />
                                发布
                            </button>
                        </div>
                    </div>

                    <div className='nb-right f--hlc'>
                        <button className={$class('btn-clear che-btn',{"not-click" : this.state.historyRW == 1})}
                                onClick={ this.revokedHistory }
                                title='撤销' />
                        <button className={$class('btn-clear hui-btn',{"not-click" : this.state.historyRW == this.state.historyRecord.length})}
                                onClick={ this.replyHistory }
                                title='恢复' />

                        <div className='dropDown-btn'>
                            <button className={$class('btn btn-clear align-btn dropDownBtn',{'active':1 === this.state.dropDownState})}
                                    title='对齐'
                                    onClick={this.dropDownShow.bind(this, 1)} />

                            <ul className={$class('dropDownToggle', { 'hide': 1 !== this.state.dropDownState })}>
                                {
                                    orderType.map((v,i)=>{
                                        return (<li className={$class(v.className, {'inactive':this.state.selectWidgets.length<2})}
                                                    key={i}
                                                    onClick={this.onClickAlignWidgets.bind(this, v.type)}>
                                            <span className={$class('icon', v.className)} />
                                            {v.name}</li>)
                                    })
                                }
                            </ul>
                        </div>

                        <div className='dropDown-btn'>
                            <button className={$class('btn btn-clear distributed-btn dropDownBtn',{'active':2 === this.state.dropDownState})}
                                    title='分布'
                                    onClick={this.dropDownShow.bind(this, 2)} />

                            <ul className={$class('dropDownToggle', { 'hide': 2 !== this.state.dropDownState })}>
                                {
                                    distributeType.map((v,i)=>{
                                        return (<li className={$class(v.className, {'inactive':this.state.selectWidgets.length<3})}
                                                    key={i}
                                                    onClick={this.onClickDistributeWidgets.bind(this, v.type)}>
                                            <span className='icon' />
                                            {v.name}</li>)
                                    })
                                }
                            </ul>
                        </div>

                        <button className={$class('btn btn-clear hide-btn',{'active':this.state.isShowRulerLine})}
                                ref="isShowRulerLine"
                                title='隐藏参考线'
                                onClick={this.onHideRulerLine} />

                        <button className={$class('btn btn-clear history-btn',{"active" : this.state.historyShow})}
                                title='历史'
                                onClick={ this.historyShow }  />

                        <button className='btn-clear less-btn'  title='缩小' onClick={ this.props.stageZoomLess }>
                            <span className='heng' />
                        </button>

                        <div className={$class('size-input', {'size-input-focus': this.state.zoomInputState },
                                                                 {'size-input-blur':!this.state.zoomInputState})}>

                            <InputNumber step={1}
                                         min={10}
                                         size='small'
                                         defaultValue={this.props.stageZoom + "%"}
                                         value={this.props.stageZoom  + "%"}
                                         onFocus={this.focusOrBlurZoomInput}
                                         onBlur={this.focusOrBlurZoomInput}
                                         onChange={this.props.stageZoomEdit}
                                         onKeyDown={this.props.stageZoomEdit} />
                        </div>

                        <button className='btn-clear plus-btn'  title='放大' onClick={ this.props.stageZoomPlus }>
                            <span className='heng' />
                            <span className='shu' />
                        </button>

                        <button className='btn-clear home-btn'  title='在线课程'  />
                    </div>
                </div>

                {
                    //<InputText title='作品名字'
                    //           visible={this.state.saveVisible}
                    //           editText={null}
                    //           onEditDone={this.onSaveDone.bind(this)} />
                }

                <div className={$class("save-work-layer f--hcc",{"hidden" : !this.state.saveVisible})}>
                    <div className="save-work">
                        <div className="save-header f--hlc">
                            <span className="icon" />
                            保存作品
                        </div>

                        <div className="save-content">
                            <label>
                                标题：
                                {
                                    this.state.saveWNError !==null
                                    ? <span style={{ color : "#ffa800" }}>( { this.state.saveWNError  } )</span>
                                    : null
                                }
                            </label>
                            <input placeholder="请输入标题" ref="saveWorkName" />

                            <label>
                                介绍：
                                {
                                    this.state.saveWDError !== null
                                        ? <span style={{ color : "#ffa800" }}>( { this.state.saveWDError  } )</span>
                                        : null
                                }
                            </label>
                            <textarea placeholder="描述至少5个字符" ref="saveWorkDescribe" />

                            <div className="btn-group f--hcc">
                                <button className="btn btn-clear cancel-btn" onClick={ this.cancelSave }>取消</button>
                                <button className="btn btn-clear sure-btn" onClick={ this.onSaveDone }>确定</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={$class("save-loading-layer f--hcc",{"hidden": !this.state.saveLoading })}>
                    <div className="save-loading">
                        <div className="save-header f--hlc">
                            <span className="icon" />
                            保存
                        </div>

                        <div className="save-content">
                            <div className="title">保存中…<span >…</span></div>
                            <div className="loading">
                                <span style={{ width : this.state.loading }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={$class("save-finish-layer f--hcc",{"hidden": !this.state.saveFinish && !this.state.saveFinishPlay })}>
                    <div className="save-finish">
                        <div className="save-header f--hlc">
                            <span className={$class("icon",{"play-icon": !this.state.saveFinish})} />
                            {
                                this.state.saveFinish
                                ? "保存"
                                : "预览"
                            }
                        </div>

                        <div className="save-content">
                            <div className="success f--hlc">
                                <span className={$class("icon", {"error-icon" : this.state.saveError})} />
                                {
                                    this.state.saveFinish
                                        ? this.state.saveError
                                            ? "保存失败！"
                                            : "保存完成！"
                                        : this.state.saveError
                                            ? "编译失败！"
                                            : "编译完成！"
                                }
                            </div>

                            <button className="btn-clear sure-btn" onClick={ this.saveFinishFuc }>确定</button>
                        </div>
                    </div>
                </div>

                <div className={$class("qrCode-layer f--hcc",{"hidden": !this.state.qrCodeShow})}>
                    <div className="qrCode">
                        <div className="qrCode-header f--hlc">
                            <span className="title-icon" />
                            <span className="flex-1">预览二维码</span>
                            <span className="close-icon" onClick={ this.qrCodeClose} />
                        </div>

                        <div className="qrCode-content">
                            <div className="qrCode-div">
                                <div className="qrCode-bg">
                                    <img src={ this.state.qrCode }/>
                                </div>
                            </div>

                            <p>此二维码仅用于预览，分享请使用“我的作品”页面中二维码</p>
                        </div>
                    </div>
                </div>

                <input id='upload-box'
                       style={{'position':'absolute', 'height':'1px', 'zIndex':'-1000', 'width':'1px'}}
                       onChange={this.onUploadChange}
                       type='file' />

                <LoginDialog title='登录'
                             visible={this.state.loginVisible}
                             editText={null}
                             editText2={null}
                             onEditDone={this.onLoginDone.bind(this)} />

                <div className={$class({"hidden": !this.state.createClass}) }>
                    <CreateModule closeClassBtn={ this.closeClassBtn }
                                  classList = { this.state.classList }  />
                </div>

                <div className={$class({"hidden": !this.state.arrangeModule }) }>
                    <ArrangeModule closeArrangeModuleBtn={ this.closeArrangeModuleBtn }
                                   createClassBtn={ this.createClassBtn } />
                </div>

                {
                    //<div className={$class({"hidden": !this.state.createDb }) }>
                    //    <CreateDb createDbHide={ this.createDbHide }
                    //              onUpdateDb={this.onUpdateDb.bind(this)}
                    //              dbList = { this.state.dbList } />
                    //</div>
                }

                <div className={$class({"hidden": !this.state.arrangeDb})}>
                    <ArrangeDb  arrangeDbHide={ this.arrangeDbHide }
                                createDbShow={ this.createDbShow }
                                onUpdateDb={this.onUpdateDb.bind(this)}
                                dbList = { this.state.dbList } />
                </div>

                <div className={$class("historyRecord", {"hidden" : !this.state.historyShow},
                                                        {"active" : !this.state.historyLayerHide}
                    )}>
                    <div className="historyRecord-header">
                        历史记录
                        <span className="btn" onClick={ this.historyLayerHide } />
                    </div>

                    <div  className="historyRecord-content">
                        <div className="scroll-layer">
                            <ul>
                                {
                                    this.state.historyNameList.map((v,i)=>{
                                        return <li key={i}
                                                   className={ $class({"active": i == this.state.historyRW-1},
                                                                {"last-icon": i > this.state.historyRW-1}
                                                   )}
                                                   onClick={ this.chooseHistory.bind(this, i+1) }>{v}</li>
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </div>

                {
                    //<div className={$class({"hidden": !this.state.createSock})}>
                    //    <CreateSock createSockHide={ this.createSockHide }
                    //                updateSock={ this.updateSock }
                    //                sockList={ this.state.sockList }  />
                    //</div>
                }
            </div>
        );
    }
}

module.exports = NavBar;

{
    //    <Row type='flex' justify='start' align='middle'>
    //        <Col span={15}>
    //            <VxMenu works={this.state.workList}
    //                    onOpen={this.onOpen}
    //                    classList={this.state.classList}
    //                    fontList={this.state.fontList}
    //                    onUploadFont={this.onUploadFont.bind(this)} />
    //        </Col>
    //
    //        <Col span={6}>
    //            <Button onClick={this.onSave}>保存</Button>
    //            <Button onClick={this.onPlay}>播放</Button>
    //            <Button onClick={this.onImport}>导入</Button>
    //            <Button onClick={this.onDelete}>删除</Button>
    //            <Button onClick={this.onLogout}>登出</Button>
    //        </Col>
    //
    //        <Col span={3}><AccountArea username={this.state.username}/></Col>
    //    </Row>
    //
    //    <LoginDialog title='登录'
    //                 visible={this.state.loginVisible}
    //                 editText={null}
    //                 editText2={null}
    //                 onEditDone={this.onLoginDone.bind(this)} />
    //
    //    <InputText title='作品名字'
    //               visible={this.state.saveVisible}
    //               editText={null}
    //               onEditDone={this.onSaveDone.bind(this)} />
    //
    //    <InputText title='导入网址'
    //               visible={this.state.importVisible}
    //               editText={null}
    //               onEditDone={this.onImportDone.bind(this)} />
    //
    //    <input id='upload-box'
    //           style={{'display':'none'}}
    //           onChange={this.onUploadChange}
    //           type='file' />
}


{
    //<div className='dropDown-btn2 f--hlc hidden'>
    //    <button className='btn btn-clear open-btn' title='作品' >
    //        <span className="icon" />
    //        <span className="title">作品</span>
    //    </button>
    //
    //    <div className='dropDownToggle'>
    //        <ul>
    //            <li>最近打开</li>
    //            {
    //                this.state.workList.length === 0
    //                    ? <li>你还没创建文件!</li>
    //                    : this.state.workList.map((v,i)=>{
    //                    return  <li key={i}
    //                                className={$class({'hidden': i >= 10})}
    //                                onClick={ this.onOpen.bind(this, v.id)}>
    //                        { i >= 10 ? null : v.name}
    //                    </li>
    //                })
    //            }
    //        </ul>
    //    </div>
    //</div>
//<div>
//    <div className='dropDown-btn dropDown-btn2'>
//        <button className={$class('btn btn-clear open-btn dropDownBtn',{'active':3 === this.state.dropDownState})}
//                title='最近打开'
//                onClick={this.dropDownShow.bind(this, 3)} />
//
//        <ul className={$class('dropDownToggle', { 'hide': 3 !== this.state.dropDownState })}>
//            <li>最近打开</li>
//            {
//                this.state.workList.length === 0
//                    ? <li>你还没创建文件!</li>
//                    : this.state.workList.map((v,i)=>{
//                    return  <li key={i}
//                                className={$class({'hidden': i >= 10})}
//                                onClick={ this.onOpen.bind(this, v.id)}>
//                        { i >= 10 ? null : v.name}
//                    </li>
//                })
//            }
//        </ul>
//    </div>
//    <button className='btn btn-clear save-btn' title='保存' onClick={this.onSave} />
//    <button className='btn btn-clear saveAs-btn'  title='另存为'  />
//    <button className='btn btn-clear history-btn' title='历史'  />
//    <button className='btn btn-clear hide-btn' title='隐藏参考线'  onClick={this.onHideRulerLine} />
//
//    <div className='dropDown-btn'>
//        <button className={$class('btn btn-clear align-btn dropDownBtn',{'active':1 === this.state.dropDownState})}
//                title='对齐'
//                onClick={this.dropDownShow.bind(this, 1)} />
//
//        <ul className={$class('dropDownToggle', { 'hide': 1 !== this.state.dropDownState })}>
//            <li className='left-icon'><span className='icon' />左对齐</li>
//            <li className='zhong-icon'><span className='icon zhong-icon' />左右居中</li>
//            <li className='right-icon' ><span className='icon right-icon' />右对齐</li>
//            <li className='top-icon'><span className='icon top-icon' />底部对齐</li>
//            <li className='middle-icon'><span className='icon middle-icon' />上下居中</li>
//            <li className='bottom-icon'><span className='icon bottom-icon' />顶部对齐</li>
//        </ul>
//    </div>
//
//    <div className='dropDown-btn'>
//        <button className={$class('btn btn-clear distributed-btn dropDownBtn',{'active':2 === this.state.dropDownState})}
//                title='分布'
//                onClick={this.dropDownShow.bind(this, 2)} />
//
//        <ul className={$class('dropDownToggle', { 'hide': 2 !== this.state.dropDownState })}>
//            <li className='stretch-icon'><span className='icon' />水平分布</li>
//            <li className='vertical-icon'><span className='icon' />垂直分布</li>
//        </ul>
//    </div>
//</div>
}