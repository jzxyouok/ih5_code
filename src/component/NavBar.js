import React from 'react';
import VxMenu from  './VxMenu';
import AccountArea from './AccountArea';
import { Button } from 'antd';
import { Row, Col } from 'antd';
import WidgetActions from '../actions/WidgetActions';
import Cookies  from 'js-cookie';
import InputText from './InputText';

import bridge from 'bridge';

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {username: null, workname: null, importname: null, saveVisible: false, importVisible: false, workList:[], classList:[]};
        this.onLogout = this.onLogout.bind(this);
        this.onOpen = this.onOpen.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onPlay = this.onPlay.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.saveCallback = this.saveCallback.bind(this);
        this.onImport = this.onImport.bind(this);

        this.userid = null;
        var name = Cookies.get('ih5user');
        if (name) {
            this.state.loginVisible = false;
            this.login(name);
        } else {
            this.state.loginVisible = true;
        }
        this.newWork();
    }

    ajaxSend(method, url, type, data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                callback(xhr.responseText);
            }
        };
        xhr.open(method, url);
        if (type)
            xhr.setRequestHeader('Content-Type', type);
        xhr.send(data);
    }

    newWork() {
        this.workid = null;
        //WidgetActions['initTree']({'stage':{'cls': 'root', 'props': {'width': 640, 'height': 480}},'defs':{'box':{'cls': 'root', 'props': {'width': 640, 'height': 480}}}});
        WidgetActions['initTree']({'stage':{'cls': 'root', 'props': {'width': 640, 'height': 480}, links:[]}});
    }

    getWorks(name) {
        Cookies.set('ih5user', name, { expires: 30 });
        this.ajaxSend('GET', 'user/'+ this.userid, null, null, (text) => {
            let result = JSON.parse(text);
            this.setState({loginVisible: false, username: name, workList:result});
        });
    }

    login(name) {
        this.ajaxSend('POST', 'login',
            'application/x-www-form-urlencoded', 'username=' + encodeURIComponent(name), (text) => {
            let r = JSON.parse(text);
            if (r.id) {
                this.userid = r.id;
                this.getWorks(name);
            }
        });
    }

    saveCallback(id, wname) {
        if (wname != null) {
            let result = [...this.state.workList, {'id': id, 'name': wname}];
            this.setState({workList: result});
        }
        this.workid = id;
        if (this.isPlay) {
            window.open('work/' + id, '_blank');
        }
    }

    onPlaySave(isPlay) {
        this.isPlay = isPlay;
        if (this.workid) {
            WidgetActions['saveNode'](this.userid, this.workid, null, this.saveCallback);
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
            this.ajaxSend('DELETE', 'work/' + this.workid, null, null, () => {
                let result = [];
                for (var i = 0; i < this.state.workList.length; i++) {
                    if (this.state.workList[i]['id'] != this.workid) {
                        result.push(this.state.workList[i]);
                    }
                }
                this.workid = null;
                this.setState({workList: result});
            });
        }
    }

    onLogout() {
        Cookies.remove('ih5user');
        this.setState({loginVisible: true, username: null});
    }

    onOpen(id) {
        this.onImportUrl('work/' + id, id);
    }

    onImportUrl(url, id) {
        this.ajaxSend('GET', url + '?raw=1', null, null, (text) => {
            //let result = JSON.parse(text);
            let result = bridge.decryptData(text);
            if (result && result['stage']) {
                this.workid = id;
                WidgetActions['initTree'](result);
            }
        });
    }

    onLoginDone(s) {
        if (s) {
            this.login(s);
            this.setState({loginVisible: false, username:s});
        }
    }

    onSaveDone(s) {
        this.setState({saveVisible: false});
        if (s)
            WidgetActions['saveNode'](this.userid, null, s, this.saveCallback);
    }

    onImportDone(s) {
        this.setState({importVisible: false});
        if (s)
            this.onImportUrl(s, null);
    }

    render() {
        return (
            <div>
                <Row type="flex" justify="start" align="middle">
                    <Col span={3}><img src="http://www.ih5.cn/css/images/logo.png" height="50px" width="200px" /></Col>
                    <Col span={12}><VxMenu works={this.state.workList} onOpen={this.onOpen} classList={this.state.classList} /></Col>
                    <Col span={6}>
                        <Button onClick={this.onSave}>保存</Button>
                        <Button onClick={this.onPlay}>播放</Button>
                        <Button onClick={this.onImport}>导入</Button>
                        <Button onClick={this.onDelete}>删除</Button>
                        <Button onClick={this.onLogout}>登出</Button>
                    </Col>
                    <Col span={3}><AccountArea username={this.state.username}/></Col>
                </Row>
                <InputText title="登录" visible={this.state.loginVisible} editText={null} onEditDone={this.onLoginDone.bind(this)} />
                <InputText title="作品名字" visible={this.state.saveVisible} editText={null} onEditDone={this.onSaveDone.bind(this)} />
                <InputText title="导入网址" visible={this.state.importVisible} editText={null} onEditDone={this.onImportDone.bind(this)} />
            </div>
        );
    }
}

module.exports = NavBar;

