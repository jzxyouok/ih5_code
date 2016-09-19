import React from 'react';
import VxMenu from  './VxMenu';
import AccountArea from './AccountArea';
import { Button } from 'antd';
import { Row, Col } from 'antd';
import WidgetActions from '../actions/WidgetActions';
import Cookies  from 'js-cookie';
import InputText from './InputText';
import LoginDialog from './LoginDialog';

import bridge from 'bridge';

var PREFIX = 'app/';

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {username: null, workname: null, importname: null, saveVisible: false, importVisible: false,
            workList:[], classList:[], fontList:[], dbList:[], sockList:[]};
        this.onLogout = this.onLogout.bind(this);
        this.onOpen = this.onOpen.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onPlay = this.onPlay.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.saveCallback = this.saveCallback.bind(this);
        this.onImport = this.onImport.bind(this);

        this.playUrl = null;
        var name = Cookies.get('ih5token');
        if (name) {
            this.state.loginVisible = false;
            this.getWorks(name);
        } else {
            this.state.loginVisible = true;
        }
        this.newWork();
    }

    newWork() {
        this.workid = null;
        //WidgetActions['initTree']({'stage':{'cls': 'root', 'props': {'width': 640, 'height': 480}},'defs':{'box':{'cls': 'root', 'props': {'width': 640, 'height': 480}}}});
        WidgetActions['initTree']({'stage':{'cls': 'root', 'props': {'width': 640, 'height': 480, 'color':'#CCCCCC'}, links:[]}});
    }

    getWorks(token) {
        WidgetActions['ajaxSend'](token, 'GET', PREFIX + 'userInfo', null, null, function(text) {
            let result = JSON.parse(text);
            if (result['name']) {
                this.playUrl = result['playUrl'];
                this.setState({loginVisible: false, username: result['name'], workList: result['list'], fontList: result['font'], dbList: result['db'], sockList: result['sock']});
            } else {
                this.setState({loginVisible: true});
            }
        }.bind(this));
    }

    login(name, pass) {
        WidgetActions['ajaxSend'](null, 'POST', PREFIX + 'login',
            'application/x-www-form-urlencoded', 'username=' + encodeURIComponent(name) + "&password=" + encodeURIComponent(pass),
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

    saveCallback(id, wname) {
        if (wname != null) {
            let result = [...this.state.workList, {'id': id, 'name': wname}];
            this.setState({workList: result});
        }
        this.workid = id;
        if (this.isPlay) {
            window.open(this.playUrl + 'work/' + id, '_blank');
        }
    }

    onPlaySave(isPlay) {
        this.isPlay = isPlay;
        if (this.workid) {
            WidgetActions['saveNode'](this.workid, null, this.saveCallback);
        } else {
            this.setState({saveVisible: true});
        }
    }

    onSave() {
        this.onPlaySave(false);
    }

    onPlay() {
        this.onPlaySave(true);
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
        this.onImportUrl(PREFIX + 'work/' + id, id);
    }

    onImportUrl(url, id) {
        WidgetActions['ajaxSend'](null, 'GET', url + '?raw=1', null, null, function(text) {
            bridge.decryptData(text, function(result) {
                if (result && result['stage']) {
                    this.workid = id;
                    WidgetActions['initTree'](result);
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

    onSaveDone(s) {
        this.setState({saveVisible: false});
        if (s)
            WidgetActions['saveNode'](null, s, this.saveCallback);
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

    render() {
        return (
            <div>
                <Row type="flex" justify="start" align="middle">
                    <Col span={15}><VxMenu works={this.state.workList} onOpen={this.onOpen} classList={this.state.classList} fontList={this.state.fontList} dbList={this.state.dbList} sockList={this.state.sockList} onUploadFont={this.onUploadFont.bind(this)} /></Col>
                    <Col span={6}>
                        <Button onClick={this.onSave}>保存</Button>
                        <Button onClick={this.onPlay}>播放</Button>
                        <Button onClick={this.onImport}>导入</Button>
                        <Button onClick={this.onDelete}>删除</Button>
                        <Button onClick={this.onLogout}>登出</Button>
                    </Col>
                    <Col span={3}><AccountArea username={this.state.username}/></Col>
                </Row>
                <LoginDialog title="登录" visible={this.state.loginVisible} editText={null} editText2={null} onEditDone={this.onLoginDone.bind(this)} />
                <InputText title="作品名字" visible={this.state.saveVisible} editText={null} onEditDone={this.onSaveDone.bind(this)} />
                <InputText title="导入网址" visible={this.state.importVisible} editText={null} onEditDone={this.onImportDone.bind(this)} />
                <input id="upload-box" style={{'display':'none'}} onChange={this.onUploadChange} type="file" />
            </div>
        );
    }
}

module.exports = NavBar;

