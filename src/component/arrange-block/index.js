//管理小模块
import React from 'react';
import $class from 'classnames';

import BlockAction from '../../actions/BlockAction';
import BlockStore from '../../stores/BlockStore';

class ArrangeBlock extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            blockList : [],
            error : "小模块名称未能为空",
            isError : false,
            chooseId : [],
            isDelete : false
        };
        // this.createClassBtn = this.createClassBtn.bind(this);
        this.chooseBtn = this.chooseBtn.bind(this);
        this.topBtn = this.topBtn.bind(this);
        this.closeArrangeBlockBtn = this.closeArrangeBlockBtn.bind(this);
        this.deleteBtn = this.deleteBtn.bind(this);
        this.deleteLayerShow = this.deleteLayerShow.bind(this);
        this.deleteLayerHide = this.deleteLayerHide.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = BlockStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(data) {
        if (data.blockList !== undefined) {
            //console.log(1,widget.blockList);
            this.setState({
                blockList: data.blockList
            });
        }
    }

    closeArrangeBlockBtn(){
        this.setState({
            error : "小模块名称未能为空",
            isError : false,
            chooseId : [],
            isDelete : false
        });
        this.props.closeArrangeBlockBtn();
    }

    // createClassBtn(){
    //     this.props.createClassBtn();
    //     this.props.closeArrangeBlockBtn();
    // }

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
                error : "请选择小模块",
                isError : true
            })
        }
        else {
            // WidgetActions['sortClass'](this.state.chooseId);
            this.setState({
                error : "小模块名称未能为空",
                isError : false,
                chooseId : []
            });
        }
    }

    deleteBtn(){
        if(this.state.chooseId.length == 0){
            this.setState({
                error : "请选择小模块",
                isError : true
            })
        }
        else {
            // WidgetActions['deleteClass'](this.state.chooseId);
            this.deleteLayerHide();
            this.setState({
                error : "小模块名称未能为空",
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
            <div className='ArrangeBlock f--hcc'>
                <div className="AM-layer"></div>

                <div className="AM-main">
                    <div className="AM-header f--hlc">
                        <span className="icon" />
                        <span className="flex-1"> 小模块整理</span>
                        <span className="close-btn" onClick={ this.closeArrangeBlockBtn} />
                    </div>

                    <div className="AM-content">
                        <div className="AM-title">全部小模块：</div>

                        <div className="AM-module" >
                            <div className="AM-scroll">
                                <ul className="AM-table">
                                    {
                                        this.state.blockList.length > 0
                                        ?   this.state.blockList.map((v,i)=>{
                                                return  <li className={ $class("f--hlc",{"active": this.state.chooseId.indexOf(v) >= 0})}
                                                            key={i}
                                                            onClick={ this.chooseBtn.bind(this, v.name, v.id)}>

                                                            <div className="flex-1 f--hlc title">
                                                                <span className="li-icon" />
                                                                <div className="TitleName">{v.name}</div>
                                                            </div>
                                                            <span className="choose-btn" />
                                                        </li>
                                            })
                                        : null
                                    }
                                    {
                                        moduleFuc(this.state.blockList.length)
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

                                <p>确定删除选中的小模块？</p>

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

module.exports = ArrangeBlock;

