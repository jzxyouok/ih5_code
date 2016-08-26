//事件
import React from 'react';
import $class from 'classnames'

import Property from './Property'

class Event extends React.Component {
    constructor (props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className={$class("Event",{"active" :this.props.nowID === this.props.id })} >
                <div className="E--title">
                    <div className="close-btn"><span className="heng" /></div>
                    <div className="open-btn"><span  className="heng"  /><span  className="shu" /></div>

                    <div className="name">{ this.props.name }</div>

                    <div className="btn">
                        <div className="btn-name">添加事件</div>
                        <div className="btn-icon"><span  className="heng"  /><span  className="shu" /></div>
                    </div>
                </div>

                <div className="E--content">
                    {
                        this.props.event.map((v,i)=>{
                            return  <div className="item" key={i}>
                                        <span className="left-line" />
                                        <div className="item-main">
                                            <div className="item-header">
                                                <span className="line" />
                                                <div className="item-title">
                                                    <span className="title-icon" />

                                                    <div className="dropDown-middle">
                                                        <div className="title">{ v.condition }</div>
                                                        <div className="dropDown"></div>
                                                    </div>

                                                    {
                                                        v.children.length === 0 || !v.children
                                                        ?   null
                                                        :   v.children.map((v1,i1)=>{
                                                                return  <div className="list" key={i1}>
                                                                            <div className="dropDown-short">
                                                                                <div className="title">{ v1.bind }</div>
                                                                                <div className="dropDown"></div>
                                                                            </div>

                                                                            <div className="dropDown-middle">
                                                                                <div className="title">{ v1.object }</div>
                                                                                <div className="dropDown"></div>
                                                                            </div>
                                                                            {
                                                                                v1.and
                                                                                ?   <div className="dropDown-short">
                                                                                        <div className="title">{ v1.bind }</div>
                                                                                        <div className="dropDown"></div>
                                                                                    </div>
                                                                                :   null
                                                                            }
                                                                            {
                                                                                v1.num ? <input/> : null
                                                                            }
                                                                            {
                                                                                v1.action
                                                                                ?   <div className="dropDown-middle">
                                                                                        <div className="title">{ v1.action }</div>
                                                                                        <div className="dropDown"></div>
                                                                                    </div>
                                                                                :   null
                                                                            }
                                                                        </div>
                                                            })
                                                    }

                                                    <div className="plus-btn">
                                                        <span className="heng" />
                                                        <span className="shu" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="item-content">

                                            </div>
                                        </div>
                                    </div>
                        })
                    }
                </div>
            </div>
        );
    }
}

module.exports = Event;

