//管理数据库
import React from 'react';
import $class from 'classnames';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

const PREFIX = 'app/';

class ArrangeDb extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            error : "数据库名称未能为空",
            isError : false,
            chooseId : [],
            isDelete : false,
            dbParm: null,
            widgetTree : null
        };
        this.createDbShow = this.createDbShow.bind(this);
        this.chooseBtn = this.chooseBtn.bind(this);
        this.topBtn = this.topBtn.bind(this);
        this.arrangeDbHide = this.arrangeDbHide.bind(this);
        this.deleteBtn = this.deleteBtn.bind(this);
        this.deleteLayerShow = this.deleteLayerShow.bind(this);
        this.deleteLayerHide = this.deleteLayerHide.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dbList) {
            this.setState({dbParm: nextProps.dbList});
        }
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
        this.onStatusChange(WidgetStore.getStore());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if (widget.initTree !== undefined){
            this.setState({
                widgetTree: widget.initTree[0]
            });
        }

        //redrawTree : 重新加载对象树
        else if (widget.redrawTree !== undefined){
            this.forceUpdate();
        }
    }

    arrangeDbHide(){
        this.setState({
            error : "数据库名称未能为空",
            isError : false,
            chooseId : [],
            isDelete : false
        });
        this.props.arrangeDbHide();
    }

    createDbShow(){
        this.props.createDbShow();
        this.arrangeDbHide();
    }

    chooseBtn(id){
        let array = this.state.chooseId;
        let index = array.indexOf(id);
        //console.log(index);
        if( index >= 0){
            array.splice(index, 1);
        }
        else {
            array.push(id);
        }
        //console.log(array);
        this.setState({
            chooseId : array
        })
    }

    topBtn(){
        if(this.state.chooseId.length == 0){
            this.setState({
                error : "请选择数据库",
                isError : true
            })
        }
        else {
            let array = this.state.chooseId;
            let list = this.props.dbList;
            let fuc = ((v,i)=>{
                list.forEach((v1,i1)=>{
                    if(v == v1.id){
                        array.splice(i,1);
                        list.unshift(v1);
                        list.splice(i1 + 1 , 1);
                        return array.map(fuc);
                    }
                });
                return  this.setState({
                            dbParm: list
                        },()=>{
                            this.props.onUpdateDb(list);
                        });
            });

            array.map(fuc);
            this.setState({
                error : "数据库名称未能为空",
                isError : false
            });
        }
    }

    deleteBtn(){
        if(this.state.chooseId.length == 0){
            this.setState({
                error : "请选择数据库",
                isError : true
            })
        }
        else {
            let array = this.state.chooseId;
            let list = this.props.dbList;
            let tree = this.state.widgetTree.tree.children;
            let fuc = ((v,i)=>{
                list.forEach((v1,i1)=>{
                    if(v == v1.id){
                        //console.log(tree);
                        tree.map((v2,i2)=>{
                            if(v2.className == "db"){
                                if(v2.node){
                                    if(v2.node.dbid == v1.id){
                                        WidgetActions['deleteTreeNode'](v2.className);
                                    }
                                }
                            }
                        });
                        array.splice(i,1);
                        list.splice(i1, 1);
                        return array.map(fuc);
                    }
                });
                return  this.setState({
                    dbParm: list
                },()=>{
                    WidgetActions['selectWidget'](this.state.widgetTree);
                    this.props.onUpdateDb(list);
                });
            });

            array.map(fuc);
            this.setState({
                error : "数据库名称未能为空",
                isError : false
            });
            this.deleteLayerHide();
        }
    }

    deleteLayerShow(){
        this.setState({
            isDelete : true
        })
    }

    deleteLayerHide(){
        this.setState({
            isDelete : false
        })
    }

    render() {
        let moduleFuc = (num)=>{
            let a = 19 - num;
            let fuc = [];
            if(a >= 0){
                for(let index = 0; index < a; index++){
                    fuc[index] = index;
                }
            }
            if(a < 0){
                let b = num % 5;
                if(5-b == 0){
                    return;
                }
                else{
                    for(let index = 0; index < 5-b; index++){
                        fuc[index] = index;
                    }
                }
            }
            return fuc.map((v,i)=>{
                return <li key={i} className="not-active"> </li>
            })
        };

        return (
            <div className='ArrangeDb f--hcc'>
                <div className="AM-layer"></div>

                <div className="AM-main">
                    <div className="AM-header f--hlc">
                        <span className="icon" />
                        <span className="flex-1">数据库整理</span>
                        <span className="close-btn" onClick={ this.arrangeDbHide} />
                    </div>

                    <div className="AM-content">
                        <div className="AM-title">全部数据库：</div>

                        <div className="AM-module" >
                            <div className="AM-scroll">
                                <ul className="AM-table">
                                    {
                                        this.props.dbList.length > 0
                                            ?   this.props.dbList.map((v,i)=>{
                                                    return  <li className={ $class({"active": this.state.chooseId.indexOf(v.id) >= 0})}
                                                                key={i}
                                                                onClick={ this.chooseBtn.bind(this, v.id)}>

                                                                <div className="title">
                                                                    <span className="li-icon" />
                                                                    <div className="TitleName">{v.name}</div>
                                                                </div>
                                                                <span className="choose-btn" />
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
                                        moduleFuc(this.props.dbList.length)
                                    }
                                </ul>
                            </div>
                        </div>

                        <div className="btn-group f--hcc">
                            <button className="btn btn-clear delete-btn" onClick={ this.deleteLayerShow }>删除</button>
                            <button className="btn btn-clear top-btn" onClick={ this.topBtn } >置顶</button>
                        </div>
                    </div>

                    <div className={$class("error",{"hidden": !this.state.isError})}>{ this.state.error }</div>

                    <div className={$class("delete-layer f--hcc",{"hidden" : !this.state.isDelete })}>
                        <div className="delete-mark"></div>

                        <div className="delete-main">
                            <div className="delete-header f--hlc">
                                <span className="icon" />
                                删除
                            </div>

                            <div className="delete-content">
                                <span />

                                <p>确定删除选中的数据库？</p>

                                <div className="btn-group f--hcc">
                                    <button className="btn btn-clear delete-btn" onClick={ this.deleteBtn }>删除</button>
                                    <button className="btn btn-clear cancel-btn" onClick={ this.deleteLayerHide }>取消</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ArrangeDb;


