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
            isError : false,
            chooseId : []
        };
        this.createClassBtn = this.createClassBtn.bind(this);
        this.chooseBtn = this.chooseBtn.bind(this);
        this.topBtn = this.topBtn.bind(this);
        this.closeArrangeModuleBtn = this.closeArrangeModuleBtn.bind(this);
        this.deleteBtn = this.deleteBtn.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if (widget.classList !== undefined) {
            //console.log(1,widget.classList);
            this.setState({
                classList: widget.classList
            });
        }
    }

    closeArrangeModuleBtn(){
        this.setState({
            error : "组件名称未能为空",
            isError : false,
            chooseId : []
        });
        this.props.closeArrangeModuleBtn();
    }

    createClassBtn(){
        this.props.createClassBtn();
        this.props.closeArrangeModuleBtn();
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
                error : "请选择组件",
                isError : true
            })
        }
        else {
            WidgetActions['sortClass'](this.state.chooseId);
            this.setState({
                error : "组件名称未能为空",
                isError : false,
                chooseId : []
            });
        }
    }

    deleteBtn(){
        if(this.state.chooseId.length == 0){
            this.setState({
                error : "请选择组件",
                isError : true
            })
        }
        else {
            WidgetActions['deleteClass'](this.state.chooseId);
            this.setState({
                error : "组件名称未能为空",
                isError : false,
                chooseId : []
            });
        }
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
                        <span className="close-btn" onClick={ this.closeArrangeModuleBtn} />
                    </div>

                    <div className="AM-content">
                        <div className="AM-title">全部组件：</div>

                        <div className="AM-module" >
                            <div className="AM-scroll">
                                <ul className="AM-table">
                                    {
                                        this.state.classList.length > 0
                                        ?   this.state.classList.map((v,i)=>{
                                                return  <li className={ $class("f--hlc",{"active": this.state.chooseId.indexOf(v) >= 0})}
                                                            key={i}
                                                            onClick={ this.chooseBtn.bind(this, v)}>

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
                            <button className="btn btn-clear delete-btn" onClick={ this.deleteBtn } >删除</button>
                            <button className="btn btn-clear top-btn" onClick={ this.topBtn } >置顶</button>
                        </div>
                    </div>

                    <div className={$class("error",{"hidden": !this.state.isError})}>{ this.state.error }</div>
                </div>
            </div>
        );
    }
}

module.exports = CreateModule;

