//数据库表格
import React from 'react';
import $class from 'classnames';
import $ from 'jquery';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';
import DbHeaderStores from '../../stores/DbHeader';
import DbHeaderAction from '../../actions/DbHeader';

var PREFIX = 'app/';

class DbTable extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            dbList : [],
            dbHeader: [],
            inputNow : null,
            inputText : null,
            inputStyle : null,
            node: null,
            allDbHeader : [],
            isAddCul : false,
            addType : 0,
            lastSelectID : null,
            isHaveContent : true,
            isError : false,
            errorText : "",
            moveLength : 0,
            multiple : 1,
            scrollWidth :　"100%",
            marginLeft : 0,
            selectArray : [],
            originalData : [],
            originalHeader : [],
            rowChooseID : null,
            columnChooseID : null,
            rowRightMenu : false,
            columnRightMenu : false,
            rowRightID : null,
            columnRightID : null,
            addColumnFuc : null,
            addColumnValue : null,
            addColumnBool : false,
            isMoveList : false
        };
        this.scrollBtn = this.scrollBtn.bind(this);
        this.addColumn = this.addColumn.bind(this);
        this.inputClick = this.inputClick.bind(this);
        this.inputChange = this.inputChange.bind(this);
        this.inputBlur = this.inputBlur.bind(this);
        this.updateHeader = this.updateHeader.bind(this);
        this.getNewData = this.getNewData.bind(this);
        this.saveBtn = this.saveBtn.bind(this);
        this.createContent =  this.createContent.bind(this);
        this.getDbList = this.getDbList.bind(this);
        this.popShow = this.popShow.bind(this);
        this.popHide = this.popHide.bind(this);
        this.whichAddType = this.whichAddType.bind(this);
        this.updateNewScrollData = this.updateNewScrollData.bind(this);
        this.getOriginalData = this.getOriginalData.bind(this);
        this.getOriginalHeader = this.getOriginalHeader.bind(this);
        this.getPDbHeader = this.getPDbHeader.bind(this);
        this.updatePDbHeader = this.updatePDbHeader.bind(this);
        this.getPDbList = this.getPDbList.bind(this);
        this.cancelBtn = this.cancelBtn.bind(this);
        this.rowChoose = this.rowChoose.bind(this);
        this.columnChoose = this.columnChoose.bind(this);
        this.clearRowColumn = this.clearRowColumn.bind(this);
        this.rowRightClick = this.rowRightClick.bind(this);
        this.columnRightClick = this.columnRightClick.bind(this);
        this.clickOthersHide = this.clickOthersHide.bind(this);
        this.rowChangeIndex = this.rowChangeIndex.bind(this);
        this.rowAddIndex = this.rowAddIndex.bind(this);
        this.rowRightMenuClick = this.rowRightMenuClick.bind(this);
        this.columnChangeIndex = this.columnChangeIndex.bind(this);
        this.columnAddIndex = this.columnAddIndex.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
        this.onStatusChange(WidgetStore.getStore());
        DbHeaderStores.listen(this.DbHeaderData.bind(this));
        //57ee37ce7f8472077f7384f7
        //57ee37e67f84726aa75f0036
        //TODO:为了本地测试虚拟获取数据
        //WidgetActions['ajaxSend'](null, 'POST', "http://play.vt.vxplo.cn/editor3/dbFind/57ee37ce7f8472077f7384f7", null, null, function(text) {
        //    let result = JSON.parse(text);
        //    if(result.d.length > 0){
        //        this.setState({
        //            dbList : result.d
        //        });
        //        this.getOriginalData();
        //    }
        //}.bind(this));
        //let name = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIwNTQxMCwiaXNzIjoiaHR0cDpcL1wvdGVzdC1iZXRhLmloNS5jblwvZWRpdG9yM2JcL2FwcFwvbG9naW4iLCJpYXQiOjE0NzU4OTY0MjEsImV4cCI6MzYwMDAwMDE0NzU4OTY0MjEsIm5iZiI6MTQ3NTg5NjQyMSwianRpIjoiOGU1YjcxM2E0NTVkM2I2NjgyOTZhYTg4YmMyYjlhZDEifQ.Z1431qqu3wcJLDZA-j840lSbwFAGo7IqzsnNue4TxlQ";
        //WidgetActions['ajaxSend'](name, 'GET', "http://test-beta.ih5.cn/editor3b/app/userInfo", null, null, function(text) {
        //    let result = JSON.parse(text);
        //    if (result['name']) {
        //        let allDbHeader = result['db'];
        //        allDbHeader.map((v,i)=>{
        //            if(allDbHeader[i].id === "57ee37ce7f8472077f7384f7"){
        //                let headerData = allDbHeader[i].header.split(",");
        //                this.setState({
        //                    dbHeader: headerData,
        //                    isHaveContent : false
        //                },()=>{
        //                    this.updateNewScrollData();
        //                });
        //                this.getOriginalHeader();
        //            }
        //        });
        //    }
        //}.bind(this));
        this.scrollBtn();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    DbHeaderData(data,bool){
        this.setState({
            allDbHeader : data,
            originalHeader:data
        },()=>{
            //console.log(bool,this.state.node);
            if(bool && this.state.node){
                if(this.state.node.dbType == "shareDb"){
                    this.getOriginalHeader();
                    this.getNewData();
                }
                else {
                    this.getPDbHeader();
                    this.getPDbList();
                }
            }
        })
    }

    onStatusChange(widget) {
        if(widget.selectWidget){
           if(widget.selectWidget.className == "db"){
               if(this.state.lastSelectID !== widget.selectWidget.node.dbid){
                   this.setState({
                       lastSelectID : widget.selectWidget.node.dbid,
                       node : widget.selectWidget.node,
                       dbList : [],
                       dbHeader: [],
                       selectArray : [],
                       originalData : [],
                       originalHeader : [],
                       inputNow : null,
                       inputText : null,
                       inputStyle : null,
                       isHaveContent : true
                   })
               }
           }
        }
    }

    getPDbList(){
        let self = this;
        let id = this.state.node.dbid;
        WidgetActions['ajaxSend'](null, 'POST', 'app/dbGetParm/' + id, null, null, function(text) {
            var result = JSON.parse(text);
            //console.log(result);
            if (result['header']) {
                let headerData = [];
                if(result['header'] != null){
                    headerData= result['header'].split(",");
                }
                this.setState({
                    dbHeader : headerData,
                    isHaveContent : false
                });
                this.state.node.find({}, function (err, data) {
                    //console.log(2,data);
                    if(data == undefined) return;

                    let list = [];
                    list = data;
                    self.setState({
                        dbList : list
                    },()=>{
                        self.updateNewScrollData(false);
                    });

                    if(list.length === 0){
                        self.createContent();
                    }
                });
                this.scrollBtn();
            }
            else {
                this.setState({
                    isHaveContent : true,
                    dbHeader : []
                })
            }
        }.bind(this));
    }

    getNewData() {
        let self = this;
        let allDbHeader = this.state.allDbHeader;
        allDbHeader.map((v,i)=>{
            if(allDbHeader[i].id === this.state.node.dbid){
                let headerData = [];
                if(allDbHeader[i].header != null){
                    headerData = allDbHeader[i].header.split(",");
                }
                //console.log(454,headerData,headerData.length);
                let index = headerData.indexOf("null");
                if(index >= 0){
                    headerData.splice(index,1)
                }
                if(headerData.length !== 0){
                    let dbHeader = headerData;
                    this.state.node.find({}, function (err, data) {
                        //console.log(2,data);
                        if(data == undefined) return;

                        let list = [];
                        list = data;
                        self.setState({
                            dbHeader : dbHeader,
                            dbList : list,
                            isHaveContent : false
                        },()=>{
                            self.updateNewScrollData(false);
                            self.getOriginalData();
                        });

                        if(list.length === 0){
                            self.createContent();
                        }
                    });
                    this.scrollBtn();
                }
                else {
                    self.setState({
                        dbHeader : [],
                        dbList : [],
                        isHaveContent : true
                    });
                }
            }
        });
    }

    createContent(){
        //let dbHeader = this.state.dbHeader;
        //let newList = {};
        //let list = [];
        //newList['id'] = this.state.node.dbid;
        //dbHeader.map((v,i)=>{
        //    newList[v] = "";
        //});
        //list.push(newList);
        this.state.node.insert({});
        this.getDbList();
    }

    getDbList(){
        let self = this;
        this.state.node.find({}, function (err, data) {
            if(data == undefined) return;

            let list = [];
            list = data;
            self.setState({
                dbList : list
            });
        });
    }

    getOriginalData(){
        let self = this;
        //WidgetActions['ajaxSend'](null,'POST', "http://play.vt.vxplo.cn/editor3/dbFind/57ee37ce7f8472077f7384f7", null, null, function(text) {
        //    let result = JSON.parse(text);
        //    if(result.d.length > 0){
        //        self.setState({
        //            originalData : result.d
        //        })
        //    }
        //}.bind(this));
        this.state.node.find({}, function (err, data) {
            let list = [];
            list = data;
            self.setState({
                originalData : list
            });
        });
    }

    getOriginalHeader(){
        //let name = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIwNTQxMCwiaXNzIjoiaHR0cDpcL1wvdGVzdC1iZXRhLmloNS5jblwvZWRpdG9yM2JcL2FwcFwvbG9naW4iLCJpYXQiOjE0NzU4OTY0MjEsImV4cCI6MzYwMDAwMDE0NzU4OTY0MjEsIm5iZiI6MTQ3NTg5NjQyMSwianRpIjoiOGU1YjcxM2E0NTVkM2I2NjgyOTZhYTg4YmMyYjlhZDEifQ.Z1431qqu3wcJLDZA-j840lSbwFAGo7IqzsnNue4TxlQ";
        //WidgetActions['ajaxSend'](name, 'GET', "http://test-beta.ih5.cn/editor3b/app/userInfo", null, null, function(text) {
        //    let result = JSON.parse(text);
        //    if (result['name']) {
        //        let allDbHeader = result['db'];
        //        allDbHeader.map((v,i)=>{
        //            if(allDbHeader[i].id === "57ee37ce7f8472077f7384f7"){
        //                let headerData = allDbHeader[i].header.split(",");
        //                this.setState({
        //                    originalHeader : headerData
        //                });
        //            }
        //        });
        //    }
        //}.bind(this));
        let data = this.state.originalHeader;
        data.map((v,i)=>{
            if(data[i].id === this.state.node.dbid){
                let headerData = [];
                if(data[i].header != null){
                    headerData = data[i].header.split(",");
                }
                let index = headerData.indexOf("null");
                if(index >= 0){
                    headerData.splice(index,1)
                }
                if(headerData.length > 0 ){
                   this.setState({
                       originalHeader : headerData
                   })
                }
            }
        });
    }

    getPDbHeader(){
        let id = this.state.node.dbid;
        let self = this;
        WidgetActions['ajaxSend'](null, 'POST', 'app/dbGetParm/' + id, null, null, function(text) {
            var result = JSON.parse(text);
            //console.log(result);
            if (result['header']) {
                let headerData = [];
                if(result['header']  != null){
                    headerData= result['header'].split(",");
                }
                this.setState({
                    dbHeader : headerData
                });
            }
        }.bind(this));
        this.state.node.find({}, function (err, data) {
            let list = [];
            list = data;
            self.setState({
                originalData : list
            });
        });
    }

    updatePDbHeader(){
        let array = this.state.dbHeader;
        let header = array.join(',');
        let id = this.state.node.dbid;
        let data = "id=" + id + "&header=" + encodeURIComponent(header);
        WidgetActions['ajaxSend'](null, 'POST', PREFIX + 'dbSetParm?' + data, null, null, function(text) {
            var result = JSON.parse(text);
            if (result['id']) {
                this.state.node['header'] = header;
                this.getPDbHeader();
                this.getPDbList();
            }
        }.bind(this));
    }

    updateHeader(bool,DdName){
        let array = this.state.dbHeader;
        let header;
        if(array.length == 0){
            header = null;
        }
        else {
            header = array.join(',');
        }
        //console.log(3,DdName);
        let name = bool ? DdName : this.state.node.name;
        //console.log(name);
        let id = this.state.node.dbid;
        let data = "id=" + id + "&name=" + encodeURIComponent(name) + "&header=" + encodeURIComponent(header);
        WidgetActions['ajaxSend'](null, 'POST', PREFIX + 'dbSetParm?' + data, null, null, function(text) {
            var result = JSON.parse(text);
            if (result['id']) {
                this.state.node['name'] = name;
                this.state.node['header'] = header;
                if(bool){
                    WidgetActions['renameWidget'](name);
                }
            }
        }.bind(this));
        let allDbHeader = this.state.allDbHeader;
        allDbHeader.map((v,i)=>{
            //console.log(2,allDbHeader[i].id === this.state.node.dbid);
            if(allDbHeader[i].id === this.state.node.dbid) {
                allDbHeader[i].header = header;
                allDbHeader[i].name = name;
                DbHeaderAction['DbHeaderData'](allDbHeader, true);
            }
        });
    }

    saveBtn(bool,DdName){
        console.log(1,this.state.dbHeader,this.state.dbList);
        let self = this;
        this.state.node.update(this.state.dbList,function(err,data){
            //console.log("1-2",data);
            if(data == undefined) return;

            self.setState({
                selectArray : [],
                originalData : [],
                originalHeader : [],
                inputNow : null,
                inputText : null,
                inputStyle : null,
                isMoveList : false
            },()=>{
                //console.log(self.state.node.dbType);
                if(self.state.node.dbType == "shareDb"){
                    self.updateHeader(bool,DdName);
                }
                else {
                    self.updatePDbHeader();
                }
            });
        });
    }

    cancelBtn(){
        this.setState({
            selectArray : [],
            originalData : [],
            originalHeader : [],
            inputNow : null,
            inputText : null,
            inputStyle : null
        },()=>{
            if(this.state.node.dbType == "shareDb"){
                this.getOriginalHeader();
                this.getNewData();
            }
            else {
                this.getPDbHeader();
                this.getPDbList();
            }
        })
    }

    updateNewScrollData(bool){
        let widthShow = this.props.isBig ? 535 : 689;
        let getWidth = parseFloat($(".DT-content table").css('width'));
        let getScrollWidth = this.props.isBig ? 555 : 707;
        let width = getWidth > widthShow ? getWidth : widthShow;
        let moveLength = width - widthShow;
        let multiple = width / widthShow;
        let scrollWidth = getScrollWidth / multiple;
        //console.log(width,getWidth,widthShow,getScrollWidth,moveLength,multiple,scrollWidth);
        this.setState({
            widthShow : widthShow,
            moveLength : moveLength,
            multiple : multiple,
            scrollWidth :　scrollWidth
        });

        if(bool){
            this.setState({
                marginLeft : 0
            },()=>{
                this.scrollBtn();
            })
        }
    }


    scrollBtn(){
        let move = false;
        let _x;
        let self = this;
        let left = this.state.marginLeft;
        let moveLength;

        $(".DbTable .scroll span").mousedown(function(e){
            move=true;
            _x=e.pageX;
            moveLength = self.state.moveLength / self.state.multiple;
        });
        $(document).mousemove(function(e){
            if(move && moveLength !== 0){
                let x =  e.pageX - _x;
                let value = left + x;
                if(left + x <=0){
                    value = 0;
                }
                if(left + x >= moveLength){
                    value = moveLength;
                }
                //console.log(value);
                self.setState({
                    marginLeft : value
                });
            }
        }).mouseup(function(){
            move=false;
            left = self.state.marginLeft
        });
    }


    addColumn(){
        let header = this.state.dbHeader;
        let inputText = this.refs.inputType.value;
        let value = null;
        let list = this.state.dbList;
        let fkList = this.state.originalData;
        let SValue =  null;
        let addColumnBool = this.state.addColumnBool;
        let addColumnFuc = this.state.addColumnFuc;
        let addColumnValue = this.state.addColumnValue;

        if(this.state.addType == 0){
            value = "s" + inputText;
            SValue = "i" + inputText;
        }
        else {
            value = "i" + inputText;
            SValue = "s" + inputText;
        }
        let index = header.indexOf(value);
        let index2 = header.indexOf(inputText);
        let index3 = header.indexOf(SValue);
        let error = (data)=>{
            this.setState({
                isError: true,
                errorText: data
            })
        };
        if(inputText.length === 0){
            error("字段名称不能为空");
        }
        else if(inputText.startsWith(" ")){
            error("字段名称不能以空格开头");
        }
        else if(inputText.endsWith(" ")){
            error("字段名称不能以空格结尾");
        }
        else if(index>=0 || index2 >=0 || index3 >= 0){
            error("字段名称不能重复");
        }
        else {
            if(addColumnBool){
                if(addColumnFuc == -1){
                    header.splice(addColumnValue, 0, value);
                }
                else {
                    header.splice(addColumnValue+1, 0, value);
                }
                list.map((v,i)=>{
                    list[i][value] = "";
                });
                fkList.map((v,i)=>{
                    fkList[i][value] = "";
                });
                //console.log(list);
                this.setState({
                    dbHeader : header,
                    dbList : list,
                    originalData : fkList,
                    isHaveContent : false,
                    isError: false
                },()=>{
                    //this.updateNewScrollData();
                    this.popHide();
                    this.saveBtn(false);
                })
            }
            else {
                header.push(value);
                //console.log(list.length);
                if(list.length == 0){
                    let self = this;
                    this.state.node.insert({}, function (err, data) {
                        if(data == undefined) return;

                        let newList = {};
                        newList['_id'] = data[0];
                        list.push(newList);
                        fkList.push(newList);

                        //console.log(list);
                        self.setState({
                            dbHeader : header,
                            dbList : list,
                            originalData : fkList,
                            isHaveContent : false,
                            isError: false
                        },()=>{
                            //self.updateNewScrollData();
                            self.popHide();
                            self.saveBtn(false);
                        })
                    });
                }
                else {
                    list.map((v,i)=>{
                        list[i][value] = "";
                    });
                    fkList.map((v,i)=>{
                        fkList[i][value] = "";
                    });
                    //console.log(list);
                    this.setState({
                        dbHeader : header,
                        dbList : list,
                        originalData : fkList,
                        isHaveContent : false,
                        isError: false
                    },()=>{
                        //this.updateNewScrollData();
                        this.popHide();
                        this.saveBtn(false);
                    })
                }
            }
        }
    }

    inputClick(key,value){
        if(key === this.state.inputNow) return;
        this.clearRowColumn();

        let width = parseFloat($(".t" + key).css('width'));
        let height = parseFloat($(".t" + key).css('height'));
        let style = {"width":width,"height":height};
        this.setState({
            inputStyle : style,
            inputText : value,
            inputNow : key,
            rowRightMenu : false,
            columnRightMenu : false
        },()=>{
            $(".i" + key).focus();
            $(".i" + key).select();
        })
    }

    inputChange(event){
        this.setState({
            inputText : event.target.value
        })
    }

    inputBlur(type,which,which2){
        let header = this.state.dbHeader;
        let list = this.state.dbList;
        this.setState({
            inputNow : null
        });
        if(type == 0) {
            let value = header[which];
            let type = value.charAt(0);
            let text;
            let SValue =  null;
            if(type == "s" ){
                text = "s" + this.state.inputText;
                SValue = "i" + this.state.inputText;
            }
            else if( type == "i" ){
                text = "i" + this.state.inputText;
                SValue = "s" + this.state.inputText;
            }
            else {
                text = this.state.inputText;
                SValue = this.state.inputText;
            }

            let index = header.indexOf(text);
            let index2 = header.indexOf(SValue);

            //console.log('a',value);
            //console.log('b',text);
            //console.log('c',index,index2);
            //console.log('d',(index >=0 && value !== text) || (index2>=0 && value !== text));
            if((index >=0 && value !== text) || (index2>=0 && value !== text)){
                if(index !== which){
                    this.setState({
                        inputText : "重命名！！！"
                    })
                }
            }
            else {
                header[which] = text;

                if(value !== text ){
                    if(type == "s" || type == "i" ){
                        value = value.substr(1);
                        text = text.substr(1);
                    }

                    let fkList = this.state.originalData;

                    list.map((v,i)=>{
                        list[i][text] = list[i][value];
                        delete list[i][value];
                    });

                    fkList.map((v,i)=>{
                        fkList[i][text] = fkList[i][value];
                        delete fkList[i][value];
                    });

                    let fc = this.state.originalHeader;
                    let id = "theader"+which;
                    let idArray = this.state.selectArray;
                    let index2 = idArray.indexOf(id);
                    if(fc[which] != text){
                        if(index2 < 0) {
                            idArray.push(id);
                        }
                    }
                    else{
                        if(index2 >=0){
                            idArray.splice(index2,1);
                        }
                    }
                    //console.log(idArray);
                    this.setState({
                        selectArray : idArray,
                        dbHeader : header,
                        dbList : list,
                        originalData : fkList
                    })
                }
                //console.log(header,list);
                //console.log(header,this.state.originalHeader);
                this.setState({
                    dbHeader : header,
                    dbList : list
                })
            }
        }
        else {
            let value = header[which2];
            let type = value.charAt(0);
            let text = "";
            let id = "tcontent"+which+"-"+which2;
            let idArray = this.state.selectArray;
            let index = idArray.indexOf(id);
            text = this.state.inputText ? this.state.inputText : "";
            let fuc = (test)=>{
                let fc = this.state.originalData;
                //console.log('a',fc);
                //console.log('b',fc[which][value]);
                //console.log('b1',which);
                //console.log('b2',value);
                //console.log('c',test);
                if((fc[which][value] != test && fc[which][value] != undefined && test)
                    || (fc[which][value] == undefined && test)){
                    if(index < 0) {
                        idArray.push(id);
                    }
                }
                else{
                    if(index >=0){
                        idArray.splice(index,1);
                    }
                }
                console.log(idArray);
                this.setState({
                    selectArray : idArray
                })
            };
            //fuc(text);
            if(type == "s" ){
                value = value.substr(1);
                fuc(text);
                list[which][value] = text;
            }
            else if( type == "i" ){
                value = value.substr(1);
                fuc(text.length == 0 ? "" : parseFloat(text));
                list[which][value] = text.length == 0 ? "" : parseFloat(text);
            }
            else {
                fuc(text);
                list[which][value] = text;
            }
            //console.log(list);
            if(which == list.length-1 && text.length > 0){
                let self = this;
                this.state.node.insert({}, function (err, data) {
                    //if(data == undefined) return;
                    //console.log(data);
                    let newList = {};
                    newList['_id'] = data[0];
                    list.push(newList);
                    let fkList = self.state.originalData;
                    fkList.push(newList);
                    self.setState({
                        dbList : list,
                        originalData : fkList
                    })
                });
                //this.getDbList();
            }
            else {
                this.setState({
                    dbList : list
                })
            }
        }
    }

    popHide(){
        this.refs.inputType.value = "";
        this.setState({
            isAddCul: false,
            isError : false,
            errorText : "",
            addColumnBool : false
        })
    }

    popShow(bool){
        this.setState({
            isAddCul: true,
            addColumnBool : bool
        })
    }

    whichAddType(i){
        this.setState({
            addType:i
        })
    }

    rowChoose(id){
        //console.log(id);
        this.setState({
            rowChooseID : id,
            columnChooseID : null
        })
    }

    columnChoose(event){
        event.stopPropagation();
        event.preventDefault();
        let id = parseInt(event.currentTarget.getAttribute("data-id"));
        this.setState({
            rowChooseID : null,
            columnChooseID : id
        })
    }

    clearRowColumn(){
        this.setState({
            rowChooseID : null,
            columnChooseID : null
        });
    }

    rowRightClick(event){
        event.preventDefault();
        event.stopPropagation();

        let id = parseInt(event.currentTarget.getAttribute("data-id"));
        this.setState({
            rowRightMenu : true,
            columnRightMenu : false,
            rowRightID : id,
            columnRightID : null,
            rowChooseID : id,
            columnChooseID : null
        });
        this.clickOthersHide();
    }

    columnRightClick(event){
        event.preventDefault();
        event.stopPropagation();

        let id = parseInt(event.currentTarget.getAttribute("data-id"));
        this.setState({
            rowRightMenu : false,
            columnRightMenu : true,
            rowRightID : null,
            columnRightID : id,
            rowChooseID : null,
            columnChooseID : id
        });
        this.clickOthersHide();
    }

    clickOthersHide(){
        let self = this;
        let fuc = function(e){
            let _con1 = $('.rowRightMenu');   // 设置目标区域
            let _con2 = $('.columnRightMenu');
            if(
                (!_con1.is(e.target) && _con1.has(e.target).length === 0)
                &&(!_con2.is(e.target) && _con2.has(e.target).length === 0)
            ){
                self.setState({
                    rowRightMenu : false,
                    columnRightMenu : false
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

    rowRightMenuClick(event){
        event.preventDefault();
        event.stopPropagation();
    }

    rowAddIndex(event){
        event.preventDefault();
        event.stopPropagation();
        let type = parseInt(event.currentTarget.getAttribute("data-type"));
        let index = parseInt(event.currentTarget.getAttribute("data-id"));
        let self = this;
        let list = this.state.dbList;
        let fkList = this.state.originalData;
        let idArray = this.state.selectArray;

        this.clearRowColumn();
        this.state.node.insert({}, function (err, data) {
            //if(data == undefined) return;
            //console.log(data);
            let newList = {};
            newList['_id'] = data[0];
            if(type == -1){
                list.splice(index, 0, newList);
                fkList.splice(index, 0, newList);
            }
            else {
                list.splice(index+1, 0, newList);
                fkList.splice(index+1, 0, newList);
            }

            idArray.map((v,i)=>{
                let a = v.indexOf('-');
                let b = parseInt(v.substring(8,a));
                let header = v.substring(0,8);
                let end = v.substring(a,v.length);
                if(type == -1){
                    if(b >= index){
                        idArray[i] = header + (b+1) + end;
                    }
                }
                else {
                    if(b > index){
                        idArray[i] = header + (b+1) + end;
                    }
                }
            });
            //console.log(list,fkList);
            self.setState({
                dbList : list,
                originalData : fkList,
                selectArray : idArray,
                rowRightMenu : false,
                columnRightMenu : false,
                isMoveList : true
            })
        });
    }

    rowChangeIndex(event){
        event.preventDefault();
        event.stopPropagation();
        let type = parseInt(event.currentTarget.getAttribute("data-type"));
        let index = parseInt(event.currentTarget.getAttribute("data-id"));
        let list = this.state.dbList;
        let fkList = this.state.originalData;
        let data = list[index];
        let fKdata = fkList[index];
        let idArray = this.state.selectArray;

        this.clearRowColumn();
        if(type == -1){
            if(index == 0) return;
        }
        else {
            if(index == list.length-1) return;
        }

        list.splice(index,1);
        fkList.splice(index,1);
        if(type == -1){
            list.splice(index-1, 0, data);
            fkList.splice(index-1, 0, fKdata);
        }
        else {
            list.splice(index+1, 0, data);
            fkList.splice(index+1, 0, fKdata);
        }
        //console.log(idArray);
        idArray.map((v,i)=>{
            let a = v.indexOf('-');
            let b = parseInt(v.substring(8,a));
            let header = v.substring(0,8);
            let end = v.substring(a,v.length);
            if(type == -1){
                if(b == index -1 ){
                    idArray[i] = header + index + end;
                }
                if(b == index){
                    idArray[i] = header + (index - 1) + end;
                }
            }
            else {
                if(b == index){
                    idArray[i] = header + (index + 1) + end;
                }
                if(b == index + 1){
                    idArray[i] = header + index + end;
                }
            }
        });
        //console.log(idArray);

        this.setState({
            dbList : list,
            originalData : fkList,
            selectArray : idArray,
            rowRightMenu : false,
            columnRightMenu : false,
            isMoveList : true
        })
    };

    columnChangeIndex(event){
        event.preventDefault();
        event.stopPropagation();
        let type = parseInt(event.currentTarget.getAttribute("data-type"));
        let index = parseInt(event.currentTarget.getAttribute("data-id"));
        let dbHeader = this.state.dbHeader;
        let fkHeader = this.state.originalHeader;
        let data = dbHeader[index];
        let fKdata = fkHeader[index];
        let idArray = this.state.selectArray;

        this.clearRowColumn();
        if(type == -1){
            if(index == 0) return;
        }
        else {
            if(index == dbHeader.length-1) return;
        }

        dbHeader.splice(index,1);
        fkHeader.splice(index,1);
        if(type == -1){
            dbHeader.splice(index-1, 0, data);
            fkHeader.splice(index-1, 0, fKdata);
        }
        else {
            dbHeader.splice(index+1, 0, data);
            fkHeader.splice(index+1, 0, fKdata);
        }

        idArray.map((v,i)=>{
            let hOrC = v.charAt(1);
            let b;
            let header;
            if(hOrC == "h"){
                b = parseInt(v.substring(7,v.length));
                header = v.substring(0,7);
            }
            else {
                let a = v.indexOf('-');
                b = parseInt(v.substring(a+1,v.length));
                header = v.substring(0,a+1);
            }
            //console.log(hOrC,b,header);
            if(type == -1){
                if(b == index -1 ){
                    idArray[i] = header + index;
                }
                if(b == index){
                    idArray[i] = header + (index - 1);
                }
            }
            else {
                if(b == index){
                    idArray[i] = header + (index + 1);
                }
                if(b == index + 1){
                    idArray[i] = header + index;
                }
            }
        });
        //console.log(idArray);

        this.setState({
            dbHeader : dbHeader,
            originalHeader : fkHeader,
            selectArray : idArray,
            rowRightMenu : false,
            columnRightMenu : false,
            isMoveList : true
        })
    };

    columnAddIndex(event){
        event.preventDefault();
        event.stopPropagation();
        let type = parseInt(event.currentTarget.getAttribute("data-type"));
        let index = parseInt(event.currentTarget.getAttribute("data-id"));

        this.setState({
            addColumnFuc : type,
            addColumnValue : index,
            isMoveList : true
        },()=>{
            this.popShow(true);
        });
    }

    render() {
        let width = this.props.isBig ? 535 : 689;

        return (
            <div className='DbTable'>
                <div className="DT-header f--h">
                    <p className="flex-1">表格</p>
                    <div className="btn-group f--hlc">
                        <button className="btn btn-clear">导入</button>
                        <button className="btn btn-clear">导出</button>
                    </div>
                </div>

                <div className="DT-main">
                    <div className="DT-scroll">
                        <div className="DT-content" style={{ width : width }}>
                            <table style={{ marginLeft : -(this.state.marginLeft) * this.state.multiple}}>
                                <thead>
                                    <tr className={$class({"onTrActive" : this.state.rowChooseID == 0})}>
                                        <td className={ $class({"hidden": this.state.dbHeader.length == 0},
                                                                {"TDZActive" : this.state.columnChooseID == 0})}
                                            onClick={ this.clearRowColumn }>
                                        </td>

                                        {
                                            this.state.dbHeader.length > 0
                                            ? this.state.dbHeader.map((v,i)=>{
                                                let id = "header" + i;
                                                let name ;
                                                let whichType;
                                                let classname =  't'+id;
                                                let type = v.charAt(0);
                                                if(type == "s" ){
                                                    name = v.substr(1);
                                                    whichType = true;
                                                }
                                                else if( type == "i" ){
                                                    name = v.substr(1);
                                                    whichType = false;
                                                }
                                                else {
                                                    name = v;
                                                    whichType = true;
                                                }
                                                return  <td key={i}
                                                            className={$class(classname,
                                                                    {"active": this.state.selectArray.indexOf(classname)>=0},
                                                                    {"TDActive": this.state.columnChooseID == i},
                                                                    {"onTDActive": this.state.columnChooseID == (i+1)}
                                                            )}
                                                            onClick={ this.inputClick.bind(this, id, name)}
                                                            onContextMenu={ this.columnRightClick.bind(this) }
                                                            data-id={i}>

                                                            <span className={ whichType ? "icon sType-icon" : "icon iType-icon" } />
                                                            <span className="mouseDown" data-id={i} onClick={ this.columnChoose.bind(this) } />

                                                            {name}

                                                            {
                                                                id === this.state.inputNow
                                                                ? <input value={ this.state.inputText }
                                                                         style={ this.state.inputStyle }
                                                                         className={ 'i'+id}
                                                                         onBlur={ this.inputBlur.bind(this,0,i) }
                                                                         onChange={ this.inputChange.bind(this) } />
                                                                : null
                                                            }

                                                            {
                                                                this.state.columnRightMenu && this.state.columnRightID == i
                                                                ?   <div  className="columnRightMenu" >
                                                                        <ul onClick={ this.rowRightMenuClick.bind(this) }>
                                                                            <li onClick={ this.columnAddIndex.bind(this) }
                                                                                data-id={i}
                                                                                data-type={-1} >
                                                                                在前面添加列
                                                                            </li>
                                                                            <li onClick={ this.columnAddIndex.bind(this) }
                                                                                data-id={i}
                                                                                data-type={1} >
                                                                                在后面添加列
                                                                            </li>
                                                                            <li className="line" />
                                                                            <li onClick={ this.columnChangeIndex.bind(this) }
                                                                                className={$class({"not-click": i == 0})}
                                                                                data-id={i}
                                                                                data-type={-1}>
                                                                                移至前一列
                                                                            </li>
                                                                            <li onClick={ this.columnChangeIndex.bind(this) }
                                                                                className={$class({"not-click": i == this.state.dbHeader.length-1})}
                                                                                data-id={i}
                                                                                data-type={1} >
                                                                                移至后一列
                                                                            </li>
                                                                            <li className="line" />
                                                                            <li className="not-click">删除此列</li>
                                                                        </ul>
                                                                    </div>
                                                                :   null
                                                            }
                                                        </td>;
                                              })
                                            : null
                                        }
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        this.state.dbList.length > 0 && this.state.dbHeader.length > 0
                                            ? this.state.dbList.map((v,i)=>{
                                                    //let index = String(i + 10);
                                                    //let data = [];
                                                    //for(let i=0;i< index.length;i++){
                                                    //    data.push(index.charAt(i))
                                                    //}
                                                    let id = "content" + i;
                                                    return  <tr key={i}
                                                                className={
                                                                    $class({"trActive" : this.state.rowChooseID == i} ,
                                                                            {"onTrActive" : this.state.rowChooseID == (i+1)})
                                                                }>

                                                                <td onClick={ this.rowChoose.bind(this, i)}
                                                                    onContextMenu={ this.rowRightClick.bind(this) }
                                                                    data-id={i}
                                                                    className={ $class({"TDZActive" : this.state.columnChooseID == 0})} >
                                                                    {
                                                                        i + 1
                                                                        //data.length > 1
                                                                        //? data.map((v3,i3)=>{
                                                                        //    return <span className="shift" key={i3}>{ v3 }</span>
                                                                        //  })
                                                                        //: <span className="shift">{data}</span>
                                                                    }

                                                                    {
                                                                        this.state.rowRightMenu && this.state.rowRightID == i
                                                                        ? <div className="rowRightMenu">
                                                                            <ul onClick={ this.rowRightMenuClick.bind(this) }>
                                                                                <li onClick={ this.rowAddIndex.bind(this) }
                                                                                    data-id={i}
                                                                                    data-type={-1} >
                                                                                    在上面添加行
                                                                                </li>
                                                                                <li onClick={ this.rowAddIndex.bind(this) }
                                                                                    data-id={i}
                                                                                    data-type={1} >
                                                                                    在下面添加行
                                                                                </li>
                                                                                <li className="line" />
                                                                                <li onClick={ this.rowChangeIndex.bind(this) }
                                                                                    className={$class({"not-click": i == 0})}
                                                                                    data-id={i}
                                                                                    data-type={-1}>
                                                                                    移至上一行
                                                                                </li>
                                                                                <li onClick={ this.rowChangeIndex.bind(this) }
                                                                                    className={$class({"not-click": i == this.state.dbList.length-1})}
                                                                                    data-id={i}
                                                                                    data-type={1} >
                                                                                    移至下一行
                                                                                </li>
                                                                                <li className="line" />
                                                                                <li className="not-click">删除此行</li>
                                                                            </ul>
                                                                            </div>
                                                                        :   null
                                                                    }
                                                                </td>
                                                                {
                                                                    this.state.dbHeader.map((v2,i2)=>{
                                                                        let classname = 't'+id+"-"+i2;
                                                                        let array = this.state.selectArray;
                                                                        let name;
                                                                        let type = v2.charAt(0);
                                                                        if(type == "s" ){
                                                                            name = v2.substr(1);
                                                                        }
                                                                        else if( type == "i" ){
                                                                            name = v2.substr(1);
                                                                        }
                                                                        else {
                                                                            name = v2;
                                                                        }
                                                                        return  <td key={ i2 }
                                                                                    className={$class(classname,
                                                                                        {"active": array.indexOf(classname) >=0 },
                                                                                        {"TDZActive": this.state.columnChooseID == i2},
                                                                                        {"onTDActive": this.state.columnChooseID == (i2+1)},
                                                                                        {"TDEActive": this.state.columnChooseID == i2
                                                                                            && this.state.dbList.length-1 == i
                                                                                        }
                                                                                    )}
                                                                                    onClick={ this.inputClick.bind(this, id+"-"+i2, v[name])}>

                                                                                    { v[name] }

                                                                                    {
                                                                                        id+"-"+i2 === this.state.inputNow
                                                                                            ? <input value={ this.state.inputText }
                                                                                                     style={ this.state.inputStyle }
                                                                                                     className={ 'i'+id+"-"+i2}
                                                                                                     onBlur={ this.inputBlur.bind(this,1,i,i2) }
                                                                                                     onChange={ this.inputChange.bind(this) } />
                                                                                            : null
                                                                                    }
                                                                                </td>
                                                                    })
                                                                }
                                                            </tr>
                                                })
                                            : null
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <p className={$class("no-tips f--hcc",{"hidden": !this.state.isHaveContent})}>请点击右上角添加按钮创建字段</p>

                    <div className="add-btn f--s" onClick={ this.popShow.bind(this,false) }>
                        <button className="btn btn-clear">
                            <span className="icon" />
                            添加
                        </button>

                        <div className="flex-1"></div>
                    </div>

                    <div className="scroll-div f--h">
                        <span className="icon"/>
                        <span className="scroll flex-1 f--hlc">
                            <span style={{ width : this.state.scrollWidth, marginLeft : this.state.marginLeft }} />
                        </span>
                    </div>
                </div>

                <div className="DT-footer f--h">
                    <div className="left flex-1 f--hlc ">
                        <div className="account">总数：100</div>
                        <div className="page">共 10 页</div>
                        <button className="btn btn-clear last-btn">上一页</button>
                        <div className="now-page">当前页：1</div>
                        <button className="btn btn-clear next-bnt">下一页</button>
                    </div>

                    <div className={ $class("right",{"hidden": this.state.selectArray.length == 0 && !this.state.isMoveList }) }>
                        <button className="btn btn-clear cancel-btn" onClick={ this.cancelBtn } >取消</button>
                        <button className="btn btn-clear save-btn" onClick={ this.saveBtn.bind(this,false) }>保存</button>
                    </div>
                </div>

                <div className={ $class("Dt-pop f--hcc",{"hidden" : !this.state.isAddCul})}>
                    <div className="pop-layer"></div>

                    <div className="pop-main">
                        <div className="pop-header f--hlc">添加字段</div>
                        <div className="pop-content">
                            <div className="title">字段类型：</div>
                            <div className="btn-group f--h">
                                <div className={$class("btn f--hcc flex-1",{"active": 0 === this.state.addType})}
                                     onClick={ this.whichAddType.bind(this, 0)}>文本</div>
                                <div className={$class("btn f--hcc flex-1",{"active": 1 === this.state.addType})}
                                     onClick={ this.whichAddType.bind(this, 1)}>数值</div>
                            </div>
                            <div className="title">
                                字段名称：
                                {
                                    this.state.isError
                                    ? <span>({ this.state.errorText })</span>
                                    : null
                                }
                            </div>
                            <input placeholder="请输入名称" ref="inputType" />

                            <div className="pop-footer f--hcc">
                                <button className="btn btn-clear cancel-btn" onClick={ this.popHide }>取消</button>
                                <button className="btn btn-clear save-btn" onClick={ this.addColumn }>确定</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = DbTable;




