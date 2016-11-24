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
            effectList : [],
            effectData : null,
            selectWidget : [],
            allTreeData : null
        };

        this.isTopSet = this.isTopSet.bind(this);
        this.addEffect = this.addEffect.bind(this);
        this.closeClassBtn = this.closeClassBtn.bind(this);
    }

    componentDidMount() {
        this.effectChange = EffectStore.listen(this.effectChangeFuc.bind(this));
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.effectChange();
        this.unsubscribe();
    }

    effectChangeFuc(data) {
        if(data.effectList){
            this.setState({
                effectList : data.effectList
            })
        }
        //if(data.createEffectShow){
        //    this.setState({
        //        show : true
        //    })
        //}
        if(data.createEffectShow){
            let isCreate = true;
            if(data.effectName !== undefined){
                let id = null;
                this.state.effectList.map((v,i)=>{
                    if(v.name == data.effectName) {
                        id = v.id;
                        return isCreate = false;
                    }
                });

                if(!isCreate){
                    let createData = JSON.stringify(this.state.effectData);
                    let effectData = {
                        data : createData
                    };
                    EffectAction['returnStart']();
                    EffectAction['updateEffect'](id,effectData);

                    let fuc = (test)=>{
                        test.map((v,i)=>{
                            if(v.className == "track" && v.timerWidget == null && v.props.name == data.effectName){
                                let updateData = this.state.effectData;
                                updateData.props.key =  undefined;
                                WidgetActions['selectWidget'](v);
                                WidgetActions['deleteTreeNode'](v.className);
                                WidgetActions['addEffect'](updateData);
                            }
                            if( v.children && v.children.length > 0){
                                fuc(v.children);
                            }
                        })
                    };
                    this.state.allTreeData.map((v,i)=>{
                        if(v.tree && v.tree.children && v.tree.children.length > 0){
                            fuc(v.tree.children);
                        }
                    });
                }
            }
            this.setState({
                show : isCreate
            })
        }
        if(data.createEffect){
            //this.state.selectWidget.props.trackType = "effect";
            //this.state.selectWidget.node.trackType = "effect";
            //this.state.selectWidget.props.name = data.createEffect;
            //this.state.selectWidget.node.name = data.createEffect;
            //let obj = {};
            //obj['trackType'] = "effect";
            //obj['name'] = data.createEffect;
            //WidgetActions['updateProperties'](obj, false, true);

            this.setState({
                show : false
            });
        }
        if(data.loadEffect){
            this.setState({
                show : false
            });
            let isCreate = false;
            let effectData = null;
            this.state.effectList.map((v,i)=>{
                if(v.name == data.effectName) {
                    if(v.is_system == 1){
                        let effectData = JSON.parse(v.data);
                        effectData.props.key = undefined;
                        effectData.props.trackType = "effect";
                        WidgetActions['deleteTreeNode'](this.state.selectWidget.className);
                        WidgetActions['addEffect'](effectData);
                    }
                    else {
                        EffectAction['getSpecificEffect'](false,v.id);
                    }
                    return isCreate = true;
                }
            });

            if(!isCreate){
                effectData = {"cls":"track","props":{"prop":["positionX","positionY","scaleX","scaleY","rotation","alpha"],
                    "data":[], "name":data.effectName,"trackType":"track","locked":false,"key": this.state.selectWidget.key}};
                WidgetActions['deleteTreeNode'](this.state.selectWidget.className);
                WidgetActions['addEffect'](effectData);
            }
        }

        if(data.loadSpecificEffect){
            let effectData = JSON.parse(data.loadSpecificEffect.data);
            effectData.props.key =  this.state.selectWidget.key;
            WidgetActions['deleteTreeNode'](this.state.selectWidget.className);
            WidgetActions['addEffect'](effectData);
        }
    }

    onStatusChange(data){
        if(data.saveEffect){
            this.setState({
                effectData : data.saveEffect
            })
        }
        if(data.selectWidget){
            let selectWidget = data.selectWidget;
            if(selectWidget.className == "track" && selectWidget.timerWidget == null){
                this.setState({
                    selectWidget : selectWidget
                })
            }
        }
        if (data.initTree !== undefined){
            console.log(data.initTree);
            this.setState({
                allTreeData : data.initTree
            });
        }
    }

    closeClassBtn(){
        this.setState({
            isTop : false,
            error : "动效名称不能为空",
            isError : false,
            show : false,
            effectData : null
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
        else if(name.substring(0,5) == "track"){
            error("动效名称不能以track为开头");
        }
        else {
            let testDate = this.state.effectData;
            testDate.props.name = name;
            let data = JSON.stringify(testDate);
            //data.props.name = name;
            let effectData = {
                name : name,
                data : data
            };
            //console.log(effectData);
            EffectAction['returnStart']();
            EffectAction['createEffect'](effectData);
            //if(this.state.isTop){
            //    effectList.unshift()
            //}
            //else {
            //    effectList.push()
            //}
        }
    }

    render() {
        return (
            <div className={ $class("CreateEffect f--hcc",{"hidden": !this.state.show })}>
                <div className="CM-layer"></div>

                <div className="CM-main">
                    <div className="CM-header f--hlc">
                        <span />
                        创建动效
                    </div>

                    <div className="CM-content" style={{ paddingBottom : "20px"}}>
                        <div className="name">动效名称：</div>
                        <input placeholder="请输入名称" ref="name" />
                        <div className="top-btn f--hlc" style={{ height : "20px"}}>
                            {
                                //onClick={ this.isTopSet }
                                //是否置顶：
                                //<span className={$class({"active" : this.state.isTop})}/>
                            }
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


