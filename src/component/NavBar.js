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

import bridge from 'bridge';
const PREFIX = 'app/';
import WidgetActions from '../actions/WidgetActions';
import WidgetStore from '../stores/WidgetStore';
import DbHeaderAction from '../actions/DbHeader'
import DbHeaderStores from '../stores/DbHeader';

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
            arrangeDb : false,
            zoomInputState: 0,
            sockList : [],
            createSock : false
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
        this.updateSock = this.updateSock.bind(this);
        this.addSock = this.addSock.bind(this);

        this.token = null;
        this.playUrl = null;
        this.fileUrl = null;
        var name = Cookies.get('ih5token');
        //console.log(name);
        if (name) {
            this.state.loginVisible = false;
            this.getWorks(name);
        } else {
            this.state.loginVisible = true;
        }
        this.newWork();
        this.workid = null;
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
        this.onStatusChange(WidgetStore.getStore());
        DbHeaderStores.listen(this.DbHeaderData.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if (widget.classList !== undefined) {
            //console.log(widget);
            this.setState({
                classList: widget.classList
            });
        }
        if(widget.selectWidget){
            this.setState({
                selectWidget : widget.selectWidget
            })
        }
    }

    newWork() {
        this.workid = null;
        WidgetActions['initTree']({'stage':{'cls': 'root', 'props': {'width': 640, 'height': 1040, 'color':'#FFFFFF'}, links:[]}});
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

    saveCallback(id, wname) {
        if (wname != null) {
            let result = [{'id': id, 'name': wname}, ...this.state.workList];
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

    onHideRulerLine(value){
        //console.log();
        if(value.target.title == '隐藏参考线'){
            value.target.title='显示参考线';
            WidgetActions['setRulerLine'](false) ;
        }else{
            value.target.title='隐藏参考线';
            WidgetActions['setRulerLine'](true) ;
        }
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
                WidgetActions['addWidget']('db', {'dbid': result['id'] }, null, name);
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
        if(this.state.selectWidget.className == "root" && this.state.selectWidget.key == 1){
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
                    this.updateSock(list);
                }

            }.bind(this));

        //this.setState({
        //    createSock : true
        //})
    }

    createSockHide(){
        this.setState({
            createSock : false
        })
    }

    updateSock(data){
        this.setState({
            sockList : data
        })
    }

    addSock(id,name){
        if(this.state.selectWidget.className == "root" && this.state.selectWidget.key == 1){
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
            }
        }
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
            <div className='NavBar f--h'>
                <div className='nb--left f--h'>
                    <div className='import'>
                        <span className='icon' />
                    </div>

                    <div className='left-group f--hlc'>
                        <button className='btn btn-clear save-btn' title='保存' onClick={this.onSave} >
                            <span className="icon" />
                            <span className="title">保存</span>
                        </button>

                        <button className='btn btn-clear template-btn' title='模板'>
                            <span className="icon" />
                            <span className="title">模板</span>
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
                            <button className='btn btn-clear data-btn' title='数据库' style={{ width : "70px" }}>
                                <span className="icon" />
                                <span className="title">数据库</span>
                            </button>

                            <div className='dropDownToggle'>
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
                                                            return  <li className="" key={i} >
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
                            <button className='btn btn-clear link-btn' title='连接'>
                                <span className="icon" />
                                <span className="title">连接</span>
                            </button>

                            <div className='dropDownToggle'>
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
                                                            return  <li className="" key={i} onClick={this.addSock.bind(this,v.id,v.name)}>
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

                        <button className='btn btn-clear shape-btn' title='形状'>
                            <span className="icon" />
                            <span className="title">形状</span>
                        </button>

                        <div className='dropDown-btn f--hlc hidden'>
                            <button className='btn btn-clear shape-btn' title='形状'>
                                <span className="icon" />
                                <span className="title">形状</span>
                            </button>
                        </div>

                        <div className='dropDown-btn2 f--hlc'>
                            <button className='btn btn-clear open-btn' title='作品' >
                                <span className="icon" />
                                <span className="title">作品</span>
                            </button>

                            <div className='dropDownToggle'>
                                <ul>
                                    <li>最近打开</li>
                                    {
                                        this.state.workList.length === 0
                                            ? <li>你还没创建文件!</li>
                                            : this.state.workList.map((v,i)=>{
                                            return  <li key={i}
                                                        className={$class({'hidden': i >= 10})}
                                                        onClick={ this.onOpen.bind(this, v.id)}>
                                                { i >= 10 ? null : v.name}
                                            </li>
                                        })
                                    }
                                </ul>
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

                        <button className='btn btn-clear qrCode-btn' title='二维码' >
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
                    <button className='btn-clear che-btn'  title='撤销' />
                    <button className='btn-clear hui-btn'  title='恢复' />

                    <div className='dropDown-btn'>
                        <button className={$class('btn btn-clear align-btn dropDownBtn',{'active':1 === this.state.dropDownState})}
                                title='对齐'
                                onClick={this.dropDownShow.bind(this, 1)} />

                        <ul className={$class('dropDownToggle', { 'hide': 1 !== this.state.dropDownState })}>
                            <li className='left-icon'><span className='icon' />左对齐</li>
                            <li className='zhong-icon'><span className='icon zhong-icon' />左右居中</li>
                            <li className='right-icon' ><span className='icon right-icon' />右对齐</li>
                            <li className='top-icon'><span className='icon top-icon' />底部对齐</li>
                            <li className='middle-icon'><span className='icon middle-icon' />上下居中</li>
                            <li className='bottom-icon'><span className='icon bottom-icon' />顶部对齐</li>
                        </ul>
                    </div>

                    <div className='dropDown-btn'>
                        <button className={$class('btn btn-clear distributed-btn dropDownBtn',{'active':2 === this.state.dropDownState})}
                                title='分布'
                                onClick={this.dropDownShow.bind(this, 2)} />

                        <ul className={$class('dropDownToggle', { 'hide': 2 !== this.state.dropDownState })}>
                            <li className='stretch-icon'><span className='icon' />水平分布</li>
                            <li className='vertical-icon'><span className='icon' />垂直分布</li>
                        </ul>
                    </div>

                    <button className='btn btn-clear hide-btn' title='隐藏参考线'  onClick={this.onHideRulerLine} />

                    <button className='btn btn-clear history-btn' title='历史'  />

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


                <InputText title='作品名字'
                           visible={this.state.saveVisible}
                           editText={null}
                           onEditDone={this.onSaveDone.bind(this)} />

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