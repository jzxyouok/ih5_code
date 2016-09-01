//事件属性框
import React from 'react';
import $class from 'classnames'

import Event from './Event'

class EventBox extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            keepIt : true
        };
        this.eventData = {
            nowId: 2,
            data: [
                {id: 1,name:"aaaa",
                    event:[
                        {eid:1 , condition:"触发条件", children:[],
                            specific:[
                                { object: "目标对象",
                                    children: [
                                        {action: "目标动作",property: []}
                                    ]
                                }
                            ]
                        }
                    ]}
                , {id: 2,name:"bbbb",
                    event:[
                        {eid:2 , condition:"点击",
                            children:[{bind:"or",object:"某某计数器",action:"计算",judgment:"=",value:"true",calculator:"true"}],
                            specific:[
                                {object:"某某图片",
                                    children: [
                                        {action:"设置属性",
                                            property:[
                                                {name:"x坐标",types:"0",value:"1920"}
                                                , {name:"y坐标",types:"0",value:"1366"}
                                                , {name:"剪切",types:"1",value:"-1"}
                                                , {name:"复制",types:"1",value:"0"}
                                                , {name:"粘贴",types:"1",value:"1"}
                                                , {name:"属性名字",types:"2",value:"20"}
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                        , {eid:3, condition:"触发条件",
                            children:[
                                {bind:"and",object:"判断对象",action:"判断条件",judgment:"=",value:"true"}
                                , {bind:"and",object:"判断对象",action:"判断条件",judgment:"=",value:"true"}
                            ]
                            , specific:[
                                {object:"某某图片",
                                    children: [
                                        {action:"设置属性",
                                            property:[
                                                {name:"x坐标",types:0,value:"1920"}
                                                , {name:"y坐标",types:0,value:"1366"}
                                                , {name:"剪切",types:1,value:-1}
                                                , {name:"复制",types:1,value:0}
                                                , {name:"粘贴",types:1,value:1}
                                                , {name:"属性名字",types:2,value:"20"}
                                            ]
                                        }
                                    ]
                                }
                                , {object:"某某计数器",
                                    children: [
                                        {action:"赋值", property:[{name:"值",types:"0",value:"100"}]}
                                    ]
                                }
                            ]
                        }
                        , {eid:4, condition:"触发条件",
                            children:[
                                {bind:"or",object:"图片",action:"隐藏",judgment:"=",value:"true"}
                                , {bind:"or",object:"图片",action:"隐藏",judgment:"=",value:"true"}
                            ]
                            , specific:[
                                {object:"目标对象",
                                    children: [
                                        {action:"目标动作",property:[]}
                                        , {action:"目标动作",property:[]}
                                    ]
                                }
                            ]
                        }
                    ]}
                , {id: 3,name:"cccc",
                    event:[
                        {eid:5 , condition:"触发条件", children:[],
                            specific:[
                                { object: "目标对象",
                                    children: [
                                        {action: "目标动作",property: []}
                                    ]
                                }
                            ]
                        }
                    ]}
                , {id: 4,name:"dddd",
                    event:[
                        {eid:6 , condition:"触发条件", children:[],
                            specific:[
                                { object: "目标对象",
                                    children: [
                                        {action: "目标动作",property: []}
                                    ]
                                }
                            ]
                        }
                    ]}
            ]
        };

        this.chooseEventBtn = this.chooseEventBtn.bind(this);
        this.keepBtn = this.keepBtn.bind(this);
    }

    chooseEventBtn(nid){
        //console.log(nid);
        this.eventData.nowId = nid;
        this.forceUpdate();
        //console.log(this.eventData.nowId);
    }

    keepBtn(){
        this.setState({
            keepIt : !this.state.keepIt
        })
    }

    render() {
        return (
            <div className={$class("EventBox",{"keep":this.state.keepIt})}>
                <div className="EB--title f--hlc">
                    <span className="flex-1">事件属性</span>
                    <button className="btn btn-clear" title="收起" onClick={this.keepBtn} />
                </div>

                <div className="EB--content-layer">
                    <div className="EB--content">
                        {
                            this.eventData.data.map((v,i)=>{
                                return <Event key={i} {...v} nowID={this.eventData.nowId} chooseEventBtn={this.chooseEventBtn} />
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = EventBox;
