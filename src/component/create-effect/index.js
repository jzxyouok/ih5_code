//创建动效
import React from 'react';
import $class from 'classnames';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class CreateModule extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isTop : false,
            error : "动效名称不能为空",
            isError : false
        };

        this.isTopSet = this.isTopSet.bind(this);
        this.addEffect = this.addEffect.bind(this);
        this.closeClassBtn = this.closeClassBtn.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {

    }

    closeClassBtn(){
        this.state = {
            isTop : false,
            error : "动效名称不能为空",
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

    addEffect(){

    }

    render() {
        return (
            <div className='CreateModule f--hcc'>
                <div className="CM-layer"></div>

                <div className="CM-main">
                    <div className="CM-header f--hlc">
                        <span />
                        创建动效
                    </div>

                    <div className="CM-content">
                        <div className="name">动效名称：</div>
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


