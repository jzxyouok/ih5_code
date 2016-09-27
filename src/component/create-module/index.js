//创建组件
import React from 'react';
import $class from 'classnames';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class CreateModule extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isTop : false,
            error : "组件名称不能为空",
            isError : false
        };

        this.isTopSet = this.isTopSet.bind(this);
        this.addClass = this.addClass.bind(this);
        this.closeClassBtn = this.closeClassBtn.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if (widget.classList !== undefined) {
            this.closeClassBtn();
        }
    }

    closeClassBtn(){
        this.state = {
            isTop : false,
            error : "组件名称不能为空",
            isError : false
        };
        this.refs.name.value = "";
        this.props.closeClassBtn();
    }

    isTopSet(){
        this.setState({
            isTop : !this.state.isTop
        })
    }

    addClass(){
        let name = this.refs.name.value;
        let index = this.props.classList.indexOf(name);
        if(name.length == 0 ){
            this.setState({
                error : "组件名称不能为空"
                , isError : true
            })
        }
        else if(index >= 0){
            this.setState({
                error : "该组件已存在"
                , isError : true
            })
        }
        else {
            //console.log(name, this.state.isTop);
            WidgetActions['addClass'](name, this.state.isTop);
        }
    }

    render() {
        return (
            <div className='CreateModule f--hcc'>
                <div className="CM-layer"></div>

                <div className="CM-main">
                    <div className="CM-header f--hlc">
                        <span />
                        创建组件
                    </div>

                    <div className="CM-content">
                        <div className="name">组件名称：</div>
                        <input placeholder="请输入名称" ref="name" />
                        <div className="top-btn f--hlc" onClick={ this.isTopSet }>
                            是否置顶：
                            <span className={$class({"active" : this.state.isTop})}/>
                        </div>

                        <div className="btn-group f--hcc">
                            <button className="btn btn-clear cancel-btn" onClick={ this.closeClassBtn }>取消</button>
                            <button className="btn btn-clear sure-btn" onClick={ this.addClass }>确定</button>
                        </div>
                    </div>

                    <div className={$class("error",{"hidden": !this.state.isError})}>{ this.state.error }</div>
                </div>
            </div>
        );
    }
}

module.exports = CreateModule;

