//管理动效
import React from 'react';
import $class from 'classnames';

import EffectAction from '../../actions/effectAction';
import EffectStore from '../../stores/effectStore';

class ArrangeModule extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            effectList : [],
            error : "请选择动效",
            isError : false,
            chooseId : [],
            isDelete : false
        };
        this.chooseBtn = this.chooseBtn.bind(this);
        this.topBtn = this.topBtn.bind(this);
        this.closeArrangeEffectBtn = this.closeArrangeEffectBtn.bind(this);
        this.deleteBtn = this.deleteBtn.bind(this);
        this.deleteLayerShow = this.deleteLayerShow.bind(this);
        this.deleteLayerHide = this.deleteLayerHide.bind(this);
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
    }

    closeArrangeEffectBtn(){
        this.setState({
            error : "请选择动效",
            isError : false,
            chooseId : [],
            isDelete : false
        });
        this.props.arrangeEffectHide();
    }

    chooseBtn(id ,is_system){
        if(is_system == 1) return;

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
                isError : true
            })
        }
        else {
            //WidgetActions['sortClass'](this.state.chooseId);
            this.setState({
                isError : false,
                chooseId : []
            });
        }
    }

    deleteBtn(){
        if(this.state.chooseId.length == 0){
            this.setState({
                isError : true
            })
        }
        else {
            this.state.effectList.map((v,i)=>{
               this.state.chooseId.forEach((v1,i1)=>{
                   if(v1 == v.id){
                       EffectAction['deleteEffect'](v.id)
                   }
               })
            });

            this.deleteLayerHide();
            this.setState({
                isError : false,
                chooseId : []
            });
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
            <div className='ArrangeEffect f--hcc'>
                <div className="AM-layer"></div>

                <div className="AM-main">
                    <div className="AM-header f--hlc">
                        <span className="icon" />
                        <span className="flex-1">动效管理</span>
                        <span className="close-btn" onClick={ this.closeArrangeEffectBtn} />
                    </div>

                    <div className="AM-content">
                        <div className="AM-title">全部动效：</div>

                        <div className="AM-module" >
                            <div className="AM-scroll">
                                <ul className="AM-table">
                                    {
                                        this.state.effectList.length > 0
                                            ?   this.state.effectList.map((v,i)=>{
                                                    return  <li className={ $class("f--hlc",
                                                                    {"active": this.state.chooseId.indexOf(v.id) >= 0}
                                                                    ,{"not-active": v.is_system == 1}
                                                                )}
                                                                key={i}
                                                                onClick={ this.chooseBtn.bind(this, v.id ,v.is_system)}>

                                                                <div className="flex-1 f--hlc title">
                                                                    <span className="li-icon" />
                                                                    <div className="TitleName">{v.is_system == 1 ? "" :v.name}</div>
                                                                </div>
                                                                <span className="choose-btn" />
                                                            </li>
                                                        })
                                            : null
                                    }
                                    {
                                        moduleFuc(this.state.effectList.length)
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

                                <p>确定删除选中的动效？</p>

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

module.exports = ArrangeModule;
