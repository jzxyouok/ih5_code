//创建动效
import React from 'react';
import $class from 'classnames';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';
import EffectAction from '../../actions/effectAction';
import EffectStore from '../../stores/effectStore';

class CreateModule extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isTop : false,
            error : "动效名称不能为空",
            isError : false,
            show : false,
            effectList : []
        };

        this.isTopSet = this.isTopSet.bind(this);
        this.addEffect = this.addEffect.bind(this);
        this.closeClassBtn = this.closeClassBtn.bind(this);
    }

    componentDidMount() {
        this.effectChange = EffectStore.listen(this.effectChangeFuc.bind(this));
    }

    componentWillUnmount() {
        this.effectChange();
    }

    effectChangeFuc(data) {
        if(data.effectList){
            this.setState({
                effectList : data.effectList
            })
        }
        if(data.createEffect){
            this.setState({
                show : true
            })
        }
    }

    closeClassBtn(){
        this.setState({
            isTop : false,
            error : "动效名称不能为空",
            isError : false,
            show : false
        });
        this.refs.name.value = "";
    }

    isTopSet(){
        this.setState({
            isTop : !this.state.isTop
        })
    }

    addEffect(){
        let name = this.refs.name.value;
        let sameName = false;
        let effectList = this.state.effectList;
        let error = (data)=>{
            this.setState({
                isError : true,
                error : data
            })
        };

        effectList.map((v,i)=>{
            if(v.name == name){
                sameName = true
            }
        });

        if(name.length == 0){
            error("动效名称不能为空");
        }
        else if(sameName){
            error("该动效已存在");
        }
        else {
            if(this.state.isTop){
                effectList.unshift()
            }
            else {
                effectList.push()
            }
        }
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
                            <button className="btn btn-clear sure-btn" onClick={ this.addEffect }>确定</button>
                        </div>
                    </div>

                    <div className={$class("error",{"hidden": !this.state.isError})}>{ this.state.error }</div>
                </div>
            </div>
        );
    }
}

module.exports = CreateModule;


