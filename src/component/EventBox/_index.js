//事件属性框
import React from 'react';
import $class from 'classnames'

import Event from './Event'

class EventBox extends React.Component {
    constructor (props) {
        super(props);
        this.state = {

        };
        this.eventData = {
            nowId: 2,
            data: [
                {id: 1,name:"aaaa",
                    event:[
                        {eid:1 , condition:"触发条件", children:[]}
                    ]}
                , {id: 2,name:"bbbb",
                    event:[
                        {eid:2 , condition:"点击", children:[{bind:"or",object:"某某计数器",action:"计算",judgment:"=",value:"true",calculator:"true"}] }
                        , {eid:3, condition:"触发条件",
                            children:[
                                {bind:"and",object:"判断对象",action:"判断条件",judgment:"=",value:"true"}
                                , {bind:"and",object:"判断对象",action:"判断条件",judgment:"=",value:"true"}
                            ]
                        }
                        , {eid:4, condition:"触发条件",
                            children:[
                                {bind:"or",object:"图片",action:"隐藏",judgment:"=",value:"true"}
                                , {bind:"or",object:"图片",action:"隐藏",judgment:"=",value:"true"}
                            ]
                        }
                    ]}
                , {id: 3,name:"cccc",
                    event:[
                        {eid:5 , condition:"触发条件", children:[]}
                    ]}
                , {id: 4,name:"dddd",
                    event:[
                        {eid:6 , condition:"触发条件", children:[]}
                    ]}
            ]
        };

        this.chooseEventBtn = this.chooseEventBtn.bind(this);
    }

    chooseEventBtn(nid){
        //console.log(nid);
        this.eventData.nowId = nid;
        this.forceUpdate();
        //console.log(this.eventData.nowId);
    }

    render() {
        return (
            <div className="EventBox">
                <div className="EB--title f--hlc">
                    <span className="flex-1">事件属性</span>
                    <button className="btn btn-clear" title="收起" />
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
