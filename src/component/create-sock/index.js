//创建数据库
import React from 'react';
import $class from 'classnames';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class CreateSock extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isError : false,
            error : "已存在该连接"
        };
        this.sureBtn = this.sureBtn.bind(this);
        this.cancelBtn = this.cancelBtn.bind(this);
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    cancelBtn(){
        this.props.createSockHide();
    }

    sureBtn(){
        let list = this.props.sockList;
        let value = this.refs.name.value;
        let bool = true;
        //console.log(list,value);
        list.map((v,i)=>{
            if(v.name == value){
                bool = false;
            }
        });

        let error = (data)=>{
            this.setState({
                error : data,
                isError : true
            })
        };

        if(value.length === 0){
            error("连接名称不能为空");
        }
        else if(value.startsWith(" ")){
            error("连接名称不能以空格开头");
        }
        else if(value.endsWith(" ")){
            error("连接名称不能以空格结尾");
        }
        else if(!bool){
            error("连接名称不能重复");
        }
        else {
            this.setState({
                error : "",
                isError : false
            });
            WidgetActions['ajaxSend'](null, 'POST', 'app/createSock',
                'application/x-www-form-urlencoded',
                'name=' + encodeURIComponent(value),
                function(text) {

                    let r = JSON.parse(text);
                    if (r['id']) {
                        list.push({'id':r['id'], 'name':value});
                        this.props.updateSock(list);
                    }

            }.bind(this));
        }
    }

    render() {
        return (
            <div className='CreateSock f--hcc'>
                <div className="CM-layer"></div>

                <div className="CM-main">
                    <div className="CM-header f--hlc">
                        <span />
                        创建连接
                    </div>

                    <div className="CM-content">
                        <div className="name">连接名称：</div>
                        <input placeholder="请输入名称"
                               ref="name" />
                        <div className="tip">
                            创建后不得修改名称
                        </div>

                        <div className="btn-group f--hcc">
                            <button className="btn btn-clear cancel-btn" onClick={ this.cancelBtn }>取消</button>
                            <button className="btn btn-clear sure-btn" onClick={ this.sureBtn }>确定</button>
                        </div>
                    </div>

                    <div className={$class("error",{"hidden": !this.state.isError})}>{ this.state.error }</div>
                </div>
            </div>
        );
    }
}

module.exports = CreateSock;

