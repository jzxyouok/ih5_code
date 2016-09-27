//管理组件
import React from 'react';
import $class from 'classnames';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class CreateModule extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            classList : [],
            error : "组件名称未能为空",
            isError : false
        };
        this.createClassBtn = this.createClassBtn.bind(this);
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

    createClassBtn(){

    }

    render() {
        let moduleFuc = (num)=>{
            let a = 27 - num;
            let fuc = [];
            if(a >= 0){
                for(let index = 0; index < a; index++){
                    fuc[index] = index;
                }
            }
            if(a < 0){
                let b = num % 4;
                if(4-b == 0){
                    return;
                }
                else{
                    for(let index = 0; index < 4-b; index++){
                        fuc[index] = index;
                    }
                }
            }
            return fuc.map((v,i)=>{
                return <li key={i} className="not-active"> </li>
            })
        };

        return (
            <div className='ArrangeModule f--hcc'>
                <div className="AM-layer"></div>

                <div className="AM-main">
                    <div className="AM-header f--hlc">
                        <span className="icon" />
                        <span className="flex-1"> 组件整理</span>
                        <span className="close-btn" onClick={ this.props.closeArrangeModuleBtn} />
                    </div>

                    <div className="AM-content">
                        <div className="AM-title">全部组件：</div>

                        <div className="AM-module" >
                            <div className="AM-scroll">
                                <ul className="AM-table">
                                    {
                                        this.state.classList.length > 0
                                        ?   this.state.classList.map((v,i)=>{
                                                return  <li className="f--hlc" key={i}>
                                                            <div className="flex-1 f--hlc title">
                                                                <span className="li-icon" />
                                                                <div className="TitleName">{v}</div>
                                                            </div>
                                                            <span className="choose-btn" />
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
                                        moduleFuc(this.state.classList.length)
                                    }
                                </ul>
                            </div>
                        </div>

                        <div className="btn-group f--hcc">
                            <button className="btn btn-clear delete-btn" >删除</button>
                            <button className="btn btn-clear top-btn" >置顶</button>
                        </div>
                    </div>

                    <div className={$class("error",{"hidden": !this.state.isError})}>{ this.state.error }</div>
                </div>
            </div>
        );
    }
}

module.exports = CreateModule;

