//创建数据库
import React from 'react';
import $class from 'classnames';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class CreateDb extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isTop : false,
            error : "数据库名称不能为空",
            isError : false,
            dbParm: null
        };

        this.isTopSet = this.isTopSet.bind(this);
        this.createDbHide = this.createDbHide.bind(this);
        this.createDb = this.createDb.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dbList) {
            this.setState({dbParm: nextProps.dbList});
        }
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if (widget.classList !== undefined) {

        }
    }

    createDbHide(){
        this.state = {
            isTop : false,
            error : "数据库名称不能为空",
            isError : false
        };
        this.refs.name.value = "";
        this.props.createDbHide();
    }

    isTopSet(){
        this.setState({
            isTop : !this.state.isTop
        })
    }

    createDb(){
        let name = this.refs.name.value;
        let index = this.props.dbList.indexOf(name);
        if(name.length == 0 ){
            this.setState({
                error : "数据库名称不能为空"
                , isError : true
            })
        }
        else if(index >= 0){
            this.setState({
                error : "该数据库已存在"
                , isError : true
            })
        }
        else {
            let data = "name=" + encodeURIComponent(name);
            WidgetActions['ajaxSend'](null, 'POST', PREFIX + 'dbParm?' + data, null, null, function(text) {
                //var result = JSON.parse(text);
                //if (result['id']) {
                //    let list = this.state.dbParm;
                //    if(this.state.isTop){
                //        list.unshift({'id': result['id'], 'key': result['id'], 'name': name });
                //    }
                //    else {
                //        list.push({'id': result['id'], 'key': result['id'], 'name': name });
                //    }
                //    this.setState({'dbParm': list});
                //    this.props.onUpdateDb(list);
                //}
            }.bind(this));
        }
    }

    render() {
        return (
            <div className='CreateDb f--hcc'>
                <div className="CM-layer"></div>

                <div className="CM-main">
                    <div className="CM-header f--hlc">
                        <span />
                        创建数据库
                    </div>

                    <div className="CM-content">
                        <div className="name">数据库名称：</div>
                        <input placeholder="请输入名称" ref="name" />
                        <div className="top-btn f--hlc" onClick={ this.isTopSet }>
                            是否置顶：
                            <span className={$class({"active" : this.state.isTop})}/>
                        </div>

                        <div className="btn-group f--hcc">
                            <button className="btn btn-clear cancel-btn" onClick={ this.createDbHide } >取消</button>
                            <button className="btn btn-clear sure-btn" onClick={ this.createDb } >确定</button>
                        </div>
                    </div>

                    <div className={$class("error",{"hidden": !this.state.isError})}>{ this.state.error }</div>
                </div>
            </div>
        );
    }
}

module.exports = CreateDb;

