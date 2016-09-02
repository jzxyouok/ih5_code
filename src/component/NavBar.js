import React from 'react';
import VxMenu from  './VxMenu';
import AccountArea from './AccountArea';
import { Button } from 'antd';
import { Row, Col } from 'antd';
import WidgetActions from '../actions/WidgetActions';
import Cookies  from 'js-cookie';
import InputText from './InputText';
import LoginDialog from './LoginDialog';
import $ from "jquery"
import $class from 'classnames'

import bridge from 'bridge';

const PREFIX = 'app/';

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
            stageZoom : 100,
            dropDownState : 0
        };

        this.onLogout = this.onLogout.bind(this);
        this.onOpen = this.onOpen.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onPlay = this.onPlay.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.saveCallback = this.saveCallback.bind(this);
        this.onImport = this.onImport.bind(this);
        this.stageZoomPlus = this.stageZoomPlus.bind(this);
        this.stageZoomLess = this.stageZoomLess.bind(this);
        this.dropDownShow = this.dropDownShow.bind(this);
        this.clickOthersHide = this.clickOthersHide.bind(this);

        this.token = null;
        this.playUrl = null;
        var name = Cookies.get('ih5token');
        if (name) {
            this.state.loginVisible = false;
            this.getWorks(name);
        } else {
            this.state.loginVisible = true;
        }
        this.newWork();
        this.workid = null;
    }

    newWork() {
        this.workid = null;
        //WidgetActions['initTree']({'stage':{'cls': 'root', 'props': {'width': 640, 'height': 480}},'defs':{'box':{'cls': 'root', 'props': {'width': 640, 'height': 480}}}});
        WidgetActions['initTree']({'stage':{'cls': 'root', 'props': {'width': 640, 'height': 480}, links:[]}});
    }

    getWorks(token) {
        WidgetActions['ajaxSend'](token, 'GET', PREFIX + 'userInfo', null, null, function(text) {
            let result = JSON.parse(text);
            if (result['name']) {
                this.playUrl = result['playUrl'];
                this.setState({loginVisible: false, username: result['name'], workList: result['list'], fontList: result['font']});
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

    stageZoomPlus(){
        if(this.state.stageZoom <120 ){
            this.setState({
                stageZoom : this.state.stageZoom + 10
            })
        }
    }

    stageZoomLess(){
        if(this.state.stageZoom >50 ){
            this.setState({
                stageZoom : this.state.stageZoom - 10
            })
        }
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
                    $(document).off("mouseup", fuc);
                })
            }
        };
        if(this.state.dropDownState !== 0){
            $(document).on("mouseup", fuc);
        }
        else {
            $(document).off("mouseup", fuc);
        }
    }

    render() {
        //console.log(this.state.workList);
        return (
            <div className="NavBar f--h">
                <div className="nb--left f--h">
                    <div className="import f--hcc">
                        <span className="icon" />
                    </div>

                    <div className="left-group f--hlc">
                        <div className="dropDown-btn dropDown-btn2">
                            <button className={$class("btn btn-clear open-btn dropDownBtn",{"active":3 === this.state.dropDownState})}
                                    title="最近打开"
                                    onClick={this.dropDownShow.bind(this, 3)} />

                            <ul className={$class("dropDownToggle", { "hide": 3 !== this.state.dropDownState })}>
                                <li>最近打开</li>
                                {
                                    this.state.workList.map((v,i)=>{
                                        return  <li key={i}
                                                    className={$class({"hidden": i >= 10})}
                                                    onClick={ this.onOpen.bind(this, v.id)}>
                                                    { i >= 10 ? null : v.name}
                                                </li>
                                    })
                                }
                            </ul>
                        </div>
                        <button className="btn btn-clear save-btn" title="保存" onClick={this.onSave} />
                        <button className="btn btn-clear saveAs-btn"  title="另存为"  />
                        <button className="btn btn-clear history-btn" title="历史"  />
                        <button className="btn btn-clear hide-btn" title="隐藏准基线"  />

                        <div className="dropDown-btn">
                            <button className={$class("btn btn-clear align-btn dropDownBtn",{"active":1 === this.state.dropDownState})}
                                    title="对齐"
                                    onClick={this.dropDownShow.bind(this, 1)} />

                            <ul className={$class("dropDownToggle", { "hide": 1 !== this.state.dropDownState })}>
                                <li className="left-icon"><span className="icon" />左对齐</li>
                                <li className="zhong-icon"><span className="icon zhong-icon" />左右居中</li>
                                <li className="right-icon" ><span className="icon right-icon" />右对齐</li>
                                <li className="top-icon"><span className="icon top-icon" />顶部对齐</li>
                                <li className="middle-icon"><span className="icon middle-icon" />上下居中</li>
                                <li className="bottom-icon"><span className="icon bottom-icon" />底部对齐</li>
                            </ul>
                        </div>

                        <div className="dropDown-btn">
                            <button className={$class("btn btn-clear distributed-btn dropDownBtn",{"active":2 === this.state.dropDownState})}
                                    title="分布"
                                    onClick={this.dropDownShow.bind(this, 2)} />

                            <ul className={$class("dropDownToggle", { "hide": 2 !== this.state.dropDownState })}>
                                <li className="stretch-icon"><span className="icon" />水平分布</li>
                                <li className="vertical-icon"><span className="icon" />垂直分布</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="nb--content flex-1 f--hcc f--hlc">
                    <button className="btn btn-clear preview-btn" title="预览" onClick={this.onPlay} >
                        <span className="icon" />
                        预览
                    </button>

                    <button className="btn btn-clear qrCode-btn" title="二维码" >
                        <span className="icon" />
                        二维码
                    </button>

                    <button className="btn btn-clear release-btn" title="发布" >
                        <span className="icon" />
                        发布
                    </button>
                </div>

                <div className="nb-right f--hlc">
                    <button className="btn-clear che-btn"  title="撤销" />
                    <button className="btn-clear hui-btn"  title="恢复" />
                    <button className="btn-clear less-btn"  title="缩小" onClick={ this.stageZoomLess }>
                        <span className="heng" />
                    </button>
                    <div className="size">{ this.state.stageZoom }%</div>
                    <button className="btn-clear plus-btn"  title="放大" onClick={ this.stageZoomPlus }>
                        <span className="heng" />
                        <span className="shu" />
                    </button>
                    <button className="btn-clear home-btn"  title="在线课程"  />
                </div>


                <InputText title="作品名字"
                           visible={this.state.saveVisible}
                           editText={null}
                           onEditDone={this.onSaveDone.bind(this)} />

                <input id="upload-box"
                       style={{'display':'none'}}
                       onChange={this.onUploadChange}
                       type="file" />

                {
                    //    <Row type="flex" justify="start" align="middle">
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
                    //    <LoginDialog title="登录"
                    //                 visible={this.state.loginVisible}
                    //                 editText={null}
                    //                 editText2={null}
                    //                 onEditDone={this.onLoginDone.bind(this)} />
                    //
                    //    <InputText title="作品名字"
                    //               visible={this.state.saveVisible}
                    //               editText={null}
                    //               onEditDone={this.onSaveDone.bind(this)} />
                    //
                    //    <InputText title="导入网址"
                    //               visible={this.state.importVisible}
                    //               editText={null}
                    //               onEditDone={this.onImportDone.bind(this)} />
                    //
                    //    <input id="upload-box"
                    //           style={{'display':'none'}}
                    //           onChange={this.onUploadChange}
                    //           type="file" />
                }
            </div>
        );
    }
}

module.exports = NavBar;
