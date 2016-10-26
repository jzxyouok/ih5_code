'use strict';
import React from 'react';
import $class from 'classnames';
import $ from 'jquery';

import WidgetActions from '../actions/WidgetActions';
import WidgetStore from '../stores/WidgetStore';
import DbHeaderStores from '../stores/DbHeader';

class  TbCome extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            tbComeShow : false,
            dbName : "选择数据库",
            dbList : [],
            dbChoose: false,
            column : 0,
            dbHeader : [],
            whichHeader : -1,
            chooseHeader : [],
            inputText : "",
            whichInput : -1,
            searchText : "",
            scrollWidth : "100%",
            moveLength : 0,
            multiple : 1,
            marginLeft : 0,
            AllDbList : [],
            isGetTb : false
        };

        this.selectWidget = null;

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.dbChooseShow = this.dbChooseShow.bind(this);
        this.dbChoosebtn = this.dbChoosebtn.bind(this);
        this.updateColumn = this.updateColumn.bind(this);
        this.chooseHeader = this.chooseHeader.bind(this);
        this.chickOtherClose =  this.chickOtherClose.bind(this);
        this.addHeader = this.addHeader.bind(this);
        this.changeInput = this.changeInput.bind(this);
        this.updateInputText = this.updateInputText.bind(this);
        this.inputBlur = this.inputBlur.bind(this);
        this.inputFocus = this.inputFocus.bind(this);
        this.updateScroll = this.updateScroll.bind(this);
        this.scrollBtn = this.scrollBtn.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
        DbHeaderStores.listen(this.DbHeaderData.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
        DbHeaderStores.removeListener(this.DbHeaderData.bind(this));
    }

    onStatusChange(widget) {
        //console.log(widget);
        if(widget.selectWidget !== undefined){
            if(widget.selectWidget.className == "table"){
                this.selectWidget = widget.selectWidget;
            }
            else {
                this.hide();
            }
        }
        if(widget.updateProperties){
            //console.log(widget);
            if(this.state.isGetTb){
                this.selectWidget.node['getResult'](0);
                this.setState({
                    isGetTb : false
                })
            }
        }
        if(widget.allWidgets){
            let dbList = [];
            widget.allWidgets.map((v,i)=>{
                if(v.className == "db"){
                    let data = {};
                    if(v.node.dbType == "shareDb"){
                        this.state.AllDbList.map((v1,i1)=>{
                            if(v1.id == v.props.dbid){
                                data = v1;
                                dbList.push(data);
                                this.setState({
                                    dbList : dbList
                                })
                            }
                        })
                    }
                    else {
                        WidgetActions['ajaxSend'](null, 'POST', 'app/dbGetParm/' + v.props.dbid, null, null, function(text) {
                            var result = JSON.parse(text);
                            //console.log(result);
                            if (result['header']) {
                                data['id'] = v.props.dbid;
                                data['name'] = v.props.name;
                                data['header'] = result['header'];
                            }
                            else {
                                data['id'] = v.props.dbid;
                                data['name'] = v.props.name;
                            }
                            dbList.push(data);
                            this.setState({
                                dbList : dbList
                            })
                        }.bind(this));
                    }
                }
            })
        }
    }

    DbHeaderData(data,bool){
        this.setState({
            AllDbList : data
        })
    }

    show(data,column,header){
        let dbName = this.state.dbName;
        let dbHeader = [];
        if(data !== null){
            this.state.dbList.map((v,i)=>{
                if(v.id == data){
                    dbName = v.name;
                    if(v.header == undefined){
                        dbHeader = [];
                    }
                    else {
                        dbHeader = v.header.split(',');
                    }
                    return {
                        dbName,
                        dbHeader
                    }
                }
            })
        }
        let index = dbHeader.indexOf("null");
        if(index >=0){
            dbHeader.splice(index, 1);
        }
        let chooseHeader = header;
        if(chooseHeader == undefined){
            chooseHeader = [];
        }
        else {
            chooseHeader = header.split(',');
        }
        this.setState({
            tbComeShow : true,
            dbName : dbName,
            column : column,
            dbHeader : dbHeader,
            chooseHeader : chooseHeader
        },()=>{
            this.updateScroll();
        });
    }

    hide(){
        this.setState({
            tbComeShow : false,
            scrollWidth : "100%",
            moveLength : 0,
            multiple : 1,
            marginLeft : 0
        })
    }

    dbChooseShow(){
        this.setState({
            whichHeader : -1,
            dbChoose: !this.state.dbChoose
        },()=>{
            if(this.state.dbChoose){
                this.chickOtherClose();
            }
        })
    }

    dbChoosebtn(id,name,header){
        this.setState({
            dbChoose: false
        });
        if(this.selectWidget.props.dbid == id) return;

        let column = this.state.column;
        let resetHeader = [];
        for(let a =0 ; a<column ; a++){
            resetHeader.push("");
        }
        this.selectWidget.props.dbid = id;
        this.selectWidget.node.dbid = id;
        this.selectWidget.props.header = resetHeader.join(',');
        this.selectWidget.node.header = resetHeader.join(',');
        WidgetActions['updateProperties'](this.selectWidget, false, true);
        //console.log(header.split(','));

        let dbHeader = header;
        if(dbHeader == undefined){
            dbHeader = [];
        }
        else {
            dbHeader = header.split(',');
            let index = dbHeader.indexOf("null");
            if(index >=0){
                dbHeader.splice(index, 1);
            }
        }

        this.setState({
            dbName : name,
            dbChoose: false,
            dbHeader : dbHeader,
            chooseHeader : resetHeader,
            whichHeader : -1,
            whichInput : -1
        })
    }

    updateColumn(column,header){
        this.setState({
            column : column,
            chooseHeader : header
        },()=>{
            this.updateScroll();
        });
    }

    chooseHeader(i){
        if(this.state.whichHeader == i){
            this.setState({
                whichHeader: -1
            })
        }
        else {
            this.setState({
                dbChoose : false,
                whichHeader: i
            });
            this.chickOtherClose();
        }
    }

    chickOtherClose(){
        let self = this;
        let fuc = function(e){
            let _con1 = $('.item-dropDown');   // 设置目标区域
            let _con2 = $('.dropDown-layer');
            if(
                (!_con1.is(e.target) && _con1.has(e.target).length === 0)
                &&(!_con2.is(e.target) && _con2.has(e.target).length === 0)
            ){
                self.setState({
                    whichHeader : -1,
                    dbChoose : false
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

    addHeader(i,name){
        let header = this.state.chooseHeader;
        header[i] = name;
        this.setState({
            chooseHeader : header,
            whichHeader : -1,
            whichInput : -1,
            isGetTb : true
        });
        this.selectWidget.props.header = header.join(',');
        this.selectWidget.node.header = header.join(',');
        WidgetActions['updateProperties'](this.selectWidget, false, true);
    }

    changeInput(i,event){
        if(event.target.value == this.state.inputText) return;

        this.setState({
            inputText : event.target.value,
            searchText : event.target.value
        },()=>{
           if(this.state.searchText.length > 0){
               this.chooseHeader(i);
           }
           else {
               this.chooseHeader(-1);
           }
        });
    }

    updateInputText(i,value){
        this.setState({
            whichInput : i,
            inputText : value
        })
    }

    inputFocus(i){
        $('.iDropDown-input' + i).select();
    }

    inputBlur(i){
        let inputText = this.state.inputText;
        let header = this.state.chooseHeader;

        this.state.dbHeader.map((v,index)=>{
            let name;
            if(v.charAt(0) == "s"){
                name = v.substring(1);
            }
            else if(v.charAt(0) == "i"){
                name = v.substring(1);
            }
            else{
                name = v
            }
            if(name == inputText){
                header[i] = inputText;
                this.selectWidget.props.header = header.join(',');
                this.selectWidget.node.header = header.join(',');
                WidgetActions['updateProperties'](this.selectWidget, false, true);
            }
        });

        this.setState({
            chooseHeader : header,
            whichHeader : -1,
            whichInput : -1,
            searchText : ""
        })
    }

    updateScroll(){
        let widthShow = 439;
        let getWidth = parseFloat($(".TbCome .item-layer .item-main").css('width'));
        let width = getWidth > widthShow ? getWidth : widthShow;
        let moveLength = width - widthShow;
        let multiple = width / widthShow;
        let scrollWidth = widthShow / multiple;

        this.setState({
            moveLength : moveLength,
            multiple : multiple,
            scrollWidth :　scrollWidth
        });
        if(moveLength <= 0){
            this.setState({
                marginLeft : 0
            })
        }
        this.scrollBtn();
    }

    scrollBtn(){
        let move = false;
        let _x;
        let self = this;
        let left = this.state.marginLeft;
        let moveLength;

        $(".TbCome .scroll span").mousedown(function(e){
            move=true;
            _x=e.pageX;
            moveLength = self.state.moveLength / self.state.multiple;

            $(document).bind('mousemove',(function(e){
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
            }));

            $(document).bind('mouseup',(function(){
                move=false;
                left = self.state.marginLeft;
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            }));
        });
    }

    render() {
        //console.log(this.state.chooseHeader);
        let num = (num)=>{
            if(!/^\d*(\.\d*)?$/.test(num)){
                return false;
            }
            var AA = new Array("零","一","二","三","四","五","六","七","八","九");
            var BB = new Array("","十","百","千","万","亿","","");
            var a = (""+ num).replace(/(^0*)/g, "").split("."), k = 0, re = "";
            for(var i=a[0].length-1; i>=0; i--){
                switch(k){
                    case 0 :
                        re = BB[7] + re;
                        break;
                    case 4 :
                        if(!new RegExp("0{4}\\d{"+ (a[0].length-i-1) +"}$").test(a[0]))
                            re = BB[4] + re;
                        break;
                    case 8 :
                        re = BB[5] + re;
                        BB[7] = BB[5];
                        k = 0;
                        break;
                }
                if(k%4 == 2 && a[0].charAt(i)=="0" && a[0].charAt(i+2) != "0") re = AA[0] + re;
                if(a[0].charAt(i) != 0) re = AA[a[0].charAt(i)] + BB[k%4] + re;
                k++;
            }
            if(a.length>1) {
                re += BB[6];
                for(var i=0; i<a[1].length; i++) re += AA[a[1].charAt(i)];
            }
            if(re.substring(0,2)=="一十"){
                re = re.replace(re.substring(0,2), "十");
            }
            if(re.length == 3 && re.charAt(1)=="百"){
                re = re.replace(re.charAt(1), "百零");
            }
            return re;
        };

        let fuc = (v)=>{
            let html = [];
            for(let a = 0; a<v; a++){
                let header = this.state.chooseHeader[a].length == 0
                                ? '选择字段'
                                : this.state.chooseHeader[a];
                if(header.charAt(0) == "s"){
                    header = header.substring(1);
                }
                else if(header.charAt(0) == "i"){
                    header = header.substring(1);
                }

                html.push(
                    <div className="item" key={ a }>
                        <div className="item-title f--hcc">第{ num(a+1) }列</div>
                        <div className={$class("item-dropDown",
                                {"not-active" : this.state.dbName == "选择数据库"},
                                {"active" : this.state.whichHeader == a}
                            )}>
                            <div className="iDropDown-title-layer">
                                <div className="iDropDown-title f--hlc">
                                    <input value={ this.state.whichInput == a ? this.state.inputText : header }
                                           onChange={ this.changeInput.bind(this,a,event) }
                                           className={"f--hlc iDropDown-input" + a}
                                           onFocus={ this.inputFocus.bind(this,a) }
                                           onBlur={ this.inputBlur.bind(this,a) }
                                           onMouseDown={ this.updateInputText.bind(this,a ,header) } />
                                    <div className="btn" onClick={ this.chooseHeader.bind(this, a)}>
                                        <span />
                                    </div>
                                </div>
                            </div>

                            <div className="iDropDown-content"
                                 style={{ height :
                                    this.state.whichHeader === a
                                        ? this.state.dbHeader.length > 9
                                            ? "198px"
                                            : this.state.dbHeader.length == 0
                                                ?  "44px"
                                                : this.state.dbHeader.length * 20 + 4 + "px"
                                        : 0
                                }}>
                                <div className="iDropDown">
                                    <ul>
                                        {
                                            this.state.dbHeader.length > 0
                                            ? this.state.dbHeader.map((k,i)=>{
                                                let name;
                                                if(k.charAt(0) == "s"){
                                                    name = k.substring(1);
                                                }
                                                else if(k.charAt(0) == "i"){
                                                    name = k.substring(1);
                                                }
                                                else{
                                                    name = k
                                                }
                                                let searchText = this.state.searchText;
                                                let isSearch = false;
                                                let searchResult = name.indexOf(searchText);
                                                if(searchText.length > 0){
                                                    isSearch = true;
                                                }
                                                return  <li key={i}
                                                            className={ $class({"hidden": isSearch && searchResult < 0 })}
                                                            onClick={ this.addHeader.bind(this,a,name)}>
                                                            {name}
                                                        </li>
                                            })
                                            : <li className="fkl">请到该数据库下面<br/> 添加字段</li>
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            return html;
        };
        return (
            <div className={$class("TbCome",{"hidden": !this.state.tbComeShow}) }>
                <div className="TC-header">
                    表格数据来源
                    <span className="close-btn" onClick={ this.hide } />
                </div>

                <div className="TC-content">
                    <div className="title"> 选择数据库：</div>

                    <div className={$class("dropDown-layer",{"active" : this.state.dbChoose})}>
                        <div className="dropDown-title" onClick={this.dbChooseShow}>
                            { this.state.dbName }
                        </div>
                        <div className="dropDown-content"
                             style={{ height :
                                    this.state.dbChoose
                                        ? this.state.dbList.length > 9
                                            ? "198px"
                                            : this.state.dbList.length == 0
                                                ?  "24px"
                                                : this.state.dbList.length * 20 + 4 + "px"
                                        : 0
                                }}>
                            <div className="dropDown">
                                <ul>
                                    {
                                        this.state.dbList.length > 0
                                        ? this.state.dbList.map((v,i)=>{
                                            return  <li key={ i } onClick={ this.dbChoosebtn.bind(this,v.id,v.name,v.header)}>
                                                        { v.name }
                                                    </li>
                                          })
                                        : <li>请添加数据库</li>
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="title">数据选择：（每一列只能对应当前选中数据库字段）</div>
                    <div className="TC-db">
                        <div className="TC-db-content">
                            <div className={$class("item-layer",{"active": this.state.whichHeader !==-1})}>
                                <div className="item-main"
                                     style={{   width: this.state.column * 129,
                                                marginLeft : -(this.state.marginLeft) * this.state.multiple}}>
                                    {
                                        this.state.column > 0
                                        ? fuc(this.state.column)
                                        : null
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="scroll">
                            <span style={{width: this.state.scrollWidth, marginLeft : this.state.marginLeft }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = TbCome;

