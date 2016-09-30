//数据库表格
import React from 'react';
import $class from 'classnames';
import $ from 'jquery';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class DbTable extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            dbList : [],
            dbHeader: [],
            columnNum : 5,
            inputNow : null,
            inputText : null,
            inputStyle : null
        };
        this.scrollBtn = this.scrollBtn.bind(this);
        this.addColumn = this.addColumn.bind(this);
        this.inputClick = this.inputClick.bind(this);
        this.inputChange = this.inputChange.bind(this);
        this.inputBlur = this.inputBlur.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
        this.onStatusChange(WidgetStore.getStore());
        //WidgetActions['ajaxSend'](null, 'POST', "http://play.vt.vxplo.cn/editor3/dbFind/57ea32507f8472077f7384f1", null, null, function(text) {
        //    let result = JSON.parse(text);
        //    if(result.d.length > 0){
        //        let dbHeader = [];
        //        for(let i in result.d[0]){
        //            if (i != "_id"){
        //                dbHeader.push(i);
        //            }
        //        }
        //        this.setState({
        //            dbHeader : dbHeader,
        //            dbList : result.d
        //        })
        //    }
        //}.bind(this));
        //this.scrollBtn();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if(widget.selectWidget){
           if(widget.selectWidget.className == "db"){
               let data = widget.selectWidget.node.dbid;
               WidgetActions['ajaxSend'](null, 'POST', "http://play.vt.vxplo.cn/editor3/dbFind/"+ data , null, null, function(text) {
                   let result = JSON.parse(text);
                   if(result.d.length > 0){
                       let dbHeader = [];
                       for(let i in result.d[0]){
                           if (i != "_id"){
                               dbHeader.push(i);
                           }
                       }
                       this.setState({
                           dbHeader : dbHeader,
                           dbList : result.d
                       })
                   }
               }.bind(this));
               this.scrollBtn();
           }
        }
    }

    scrollBtn(){
        //let move = false;
        //let _x;
        //let self = this;
        //let left = 0;
        //let width = parseFloat($(".DT-content table").css('width'));
        //let widthShow = this.props.isBig ?
        //console.log(width);
        //
        //$(".DbTable .scroll span").mousedown(function(e){
        //    move=true;
        //    _x=e.pageX;
        //});
        //$(document).mousemove(function(e){
        //    if(move){
        //        let x =  e.pageX - _x;
        //    }
        //}).mouseup(function(){
        //    move=false;
        //});
    }


    addColumn(){
        this.setState({
            columnNum : this.state.columnNum + 1
        })
    }

    inputClick(key,value){
        if(key === this.state.inputNow) return;

        let width = parseFloat($(".t" + key).css('width'));
        let height = parseFloat($(".t" + key).css('height'));
        let style = {"width":width,"height":height};
        this.setState({
            inputStyle : style,
            inputText : value,
            inputNow : key
        },()=>{
            $(".i" + key).focus();
        })
    }

    inputChange(event){
        this.setState({
            inputText : event.target.value
        })
    }

    inputBlur(){
        this.setState({
            inputNow : null
        })
    }

    render() {
        let width = this.props.isBig ? 769 : 928;

        let shuFuc = (data,num)=>{
            let a = num - data;
            let fuc = [];
            if(a < 0){
                fuc = [0];
            }
            else{
                for(let index = 0; index < a; index++){
                    fuc[index] = index;
                }
            }
            return fuc.map((v,i)=>{
                return  <td key={i}>

                        </td>
            })
        };

        return (
            <div className='DbTable'>
                <div className="DT-header f--h">
                    <p className="flex-1">列表</p>
                    <div className="btn-group">
                        <button className="btn btn-clear">导入</button>
                        <button className="btn btn-clear">导出</button>
                    </div>
                </div>

                <div className="DT-main">
                    <div className="DT-scroll">
                        <div className="DT-content" style={{ width : width }}>
                            <table>
                                <thead>
                                    <tr>
                                        <td></td>

                                        {
                                            this.state.dbList.length > 0
                                            ? this.state.dbHeader.map((v,i)=>{
                                                let id = "header" + i;
                                                return  <td key={i}
                                                            className={ 't'+id}
                                                            onClick={ this.inputClick.bind(this, id, v)}>
                                                            {v}

                                                            {
                                                                id === this.state.inputNow
                                                                ? <input value={ this.state.inputText }
                                                                         style={ this.state.inputStyle }
                                                                         className={ 'i'+id}
                                                                         onBlur={ this.inputBlur.bind(this) }
                                                                         onChange={ this.inputChange.bind(this) } />
                                                                : null
                                                            }
                                                        </td>;
                                              })
                                            : null
                                        }
                                        { shuFuc(this.state.dbHeader.length,this.state.columnNum)}
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        this.state.dbList.length > 0
                                            ? this.state.dbList.map((v,i)=>{
                                                    let index = String(i);
                                                    let data = [];
                                                    for(let i=0;i< index.length;i++){
                                                        data.push(index.charAt(i))
                                                    }
                                                    return  <tr key={i}>
                                                                <td>
                                                                    {
                                                                        data.length > 1
                                                                        ? data.map((v3,i3)=>{
                                                                            return <span className="shift" key={i3}>{ v3 }</span>
                                                                          })
                                                                        : data
                                                                    }
                                                                </td>
                                                                {
                                                                    this.state.dbHeader.map((v2,i2)=>{
                                                                        return <td key={ i2 }>{ v[v2] }</td>
                                                                    })
                                                                }
                                                                {shuFuc(this.state.dbHeader.length,this.state.columnNum)}
                                                            </tr>
                                                })
                                            : null
                                    }

                                    <tr>
                                        {shuFuc(-1,this.state.columnNum)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="add-btn f--s" onClick={ this.addColumn }>
                        <button className="btn btn-clear">
                            <span className="icon" />
                            添加
                        </button>

                        <div className="flex-1"></div>
                    </div>

                    <div className="scroll-div f--h">
                        <span className="icon"/>
                        <span className="scroll flex-1 f--hlc">
                            <span style={{ }} />
                        </span>
                    </div>
                </div>

                <div className="DT-footer f--h">
                    <div className="left flex-1 f--hlc ">
                        <div className="account">总数： 100</div>
                        <div className="page">共 10 页</div>
                        <button className="btn btn-clear last-btn">上一页</button>
                        <div className="now-page">当前页： 1</div>
                        <button className="btn btn-clear next-bnt">下一页</button>
                    </div>

                    <div className="right f--hlc">
                        <button className="btn btn-clear cancel-btn" onClick={ this.props.editDbHide }>取消</button>
                        <button className="btn btn-clear save-btn">保存</button>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = DbTable;




