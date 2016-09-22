//事件属性框
import React from 'react';
import $class from 'classnames'

import Event from './Event'

class EventBox extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            keepIt : false,
            activeWid: 1,
        };
        this.eventData = [
            {
                wid: 1,
                name:'stage',
                event:[
                    {   eid:1 ,
                        condition:'触发条件',
                        children:[],
                        specific:[
                            {
                                sid:1,
                                object: '目标对象',
                                children: [
                                    {   action: '目标动作',
                                        property: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },{
                wid: 2,
                name:'rect',
                event:[
                    {
                        eid:2 ,
                        condition:'点击',
                        children:[{bind:'or',object:'某某计数器',action:'计算',judgment:'=',value:'true',calculator:'true'}],
                        specific:[
                            {
                                sid:2,
                                object:'某某图片',
                                children: [
                                    {   action:'设置属性',
                                        property:[
                                            {name:'x坐标',types:'0',value:'1920'},
                                            {name:'y坐标',types:'0',value:'1366'},
                                            {name:'剪切',types:'1',value:'-1'},
                                            {name:'复制',types:'1',value:'0'},
                                            {name:'粘贴',types:'1',value:'1'},
                                            {name:'属性名字',types:'2',value:'20'}
                                        ]
                                    }
                                ]
                            }
                        ]
                    },{
                        eid:3,
                        condition:'触发条件',
                        children:[
                            {bind:'and',object:'判断对象',action:'判断条件',judgment:'=',value:'true'},
                            {bind:'and',object:'判断对象',action:'判断条件',judgment:'=',value:'true'}
                        ],
                        specific:[
                            {
                                sid:3,
                                object:'某某图片',
                                children: [
                                    {   action:'设置属性',
                                        property:[
                                            {name:'x坐标',types:0,value:'1920'},
                                            {name:'y坐标',types:0,value:'1366'},
                                            {name:'剪切',types:1,value:-1},
                                            {name:'复制',types:1,value:0},
                                            {name:'粘贴',types:1,value:1},
                                            {name:'属性名字',types:2,value:'20'}
                                        ]
                                    }
                                ]
                            },{
                                sid:4,
                                object:'某某计数器',
                                children: [
                                    {   action:'赋值',
                                        property:[
                                            {name:'值',types:'0',value:'100'}
                                        ]
                                    }
                                ]
                            }
                        ]
                    },{
                        eid:4,
                        condition:'触发条件',
                        children:[
                            {bind:'or',object:'图片',action:'隐藏',judgment:'=',value:'true'},
                            {bind:'or',object:'图片',action:'隐藏',judgment:'=',value:'true'}
                        ],
                        specific:[
                            {
                                sid:5,
                                object:'目标对象',
                                children: [
                                    {   action:'目标动作',
                                        property:[]
                                    },
                                    { action:'目标动作',
                                        property:[]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },{
                wid: 3,
                name:'cccc',
                event:[
                    {   eid:5 ,
                        condition:'触发条件',
                        children:[],
                        specific:[
                            {
                                sid:6,
                                object: '目标对象',
                                children: [
                                    {   action: '目标动作',
                                        property: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },{
                wid: 4,
                name:'dddd',
                event:[
                    {   eid:6 ,
                        condition:'触发条件',
                        children:[],
                        specific:[
                            {
                                sid:7,
                                object: '目标对象',
                                children: [
                                    {   action: '目标动作',
                                        property: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

        this.chooseEventBtn = this.chooseEventBtn.bind(this);
        this.keepBtn = this.keepBtn.bind(this);
    }

    chooseEventBtn(nid){
        this.setState({
            activeWid: nid
        });
    }

    keepBtn(){
        this.setState({
            keepIt : !this.state.keepIt
        })
    }

    render() {
        return (
            <div className={$class('EventBox',{'keep':this.state.keepIt}, {'hidden':this.props.isHidden})}
                 style={{ left : this.props.expended? '65px':'37px'}}>
                <div className='EB--title f--hlc'>
                    <span className='flex-1'>事件属性</span>
                    <button className='btn btn-clear' title='收起' onClick={this.keepBtn} />
                </div>

                <div className='EB--content-layer'>
                    <div className='EB--content'>
                        {
                            this.eventData.map((v,i)=>{
                                return <Event key={i} {...v} activeWid={this.state.activeWid} chooseEventBtn={this.chooseEventBtn} />
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = EventBox;
