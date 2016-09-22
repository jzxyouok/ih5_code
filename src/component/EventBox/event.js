//事件
import React from 'react';
import $class from 'classnames'

import Property from './Property'

class Event extends React.Component {
    constructor (props) {
        super(props);
        this.state = {

        };
        this.chooseEventBtn = this.chooseEventBtn.bind(this);
    }

    chooseEventBtn(nid){
        this.props.chooseEventBtn(nid);
    }

    render() {
        let content = ((v,i)=>{
            return  <div className='item f--h' key={i}>
                        <span className='left-line' />
                        <div className='item-main flex-1'>
                            <div className='item-header f--h'>
                                <span className='close-line' />
                                <div className='item-title flex-1 f--h'>
                                    <div className='left'>
                                        <div className='left-layer  f--h'>
                                            <span className='title-icon' />
                                            <div className='dropDown-layer long'>
                                                <div className='title f--hlc'>
                                                    { v.condition }
                                                    <span className='icon' />
                                                </div>
                                                <div className='dropDown'></div>
                                            </div>
                                        </div>
                                    </div>


                                    {
                                        v.children.length === 0 || !v.children
                                        ? null
                                        : <div className='zhong'>
                                            {
                                                v.children.map((v1,i1)=>{
                                                return  <div className='list f--hlc' key={i1}>
                                                            <span className='supplement-line' />
                                                            <div className='dropDown-layer short'>
                                                                <div className='title f--hlc'>
                                                                    { v1.bind }
                                                                    <span className='icon' />
                                                                </div>
                                                                <div className='dropDown'></div>
                                                            </div>

                                                            <div className='dropDown-layer long'>
                                                                <div className='title f--hlc'>
                                                                    { v1.object }
                                                                    <span className='icon' />
                                                                </div>
                                                                <div className='dropDown'></div>
                                                            </div>

                                                            <div className='dropDown-layer long'>
                                                                <div className='title f--hlc'>
                                                                    { v1.action }
                                                                    <span className='icon' />
                                                                </div>
                                                                <div className='dropDown'></div>
                                                            </div>

                                                            <div className='dropDown-layer short'>
                                                                <div className='title f--hlc'>
                                                                    { v1.judgment }
                                                                    <span className='icon' />
                                                                </div>
                                                                <div className='dropDown'></div>
                                                            </div>

                                                            {
                                                                v1.calculator
                                                                ? <div className='number f--hlc'>
                                                                    <input />
                                                                    <div className='number-icon flex-1'>
                                                                        <div className='shang-btn'><span/></div>
                                                                        <div className='xia-btn'><span/></div>
                                                                    </div>
                                                                  </div>

                                                                : <div className='dropDown-layer middle'>
                                                                    <div className='title f--hlc'>
                                                                        { v1.value }
                                                                        <span className='icon' />
                                                                    </div>
                                                                    <div className='dropDown'></div>
                                                                  </div>
                                                            }

                                                            <span className='close-btn' />
                                                        </div>
                                                    })
                                            }
                                          </div>
                                    }

                                    <div className='right flex-1'>
                                        <div className='right-layer'>
                                            <div className='plus-btn'>
                                                <div className='btn'>
                                                    <span className='heng' />
                                                    <span className='shu' />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='item-content'>
                                {
                                    v.specific.length === 0
                                    ? null
                                    : v.specific.map((v2,i2)=>{
                                        return <Property key={i2} {...v2} />
                                    })
                                }
                            </div>
                        </div>
                    </div>
        });

        return (
            <div className={$class('Event',{'active' :this.props.currentId === this.props.id })}
                 onClick={this.chooseEventBtn.bind(this, this.props.id)}>
                <div className='E--title f--h'>
                    <div className='title-content f--hlc flex-1'>
                        <div className='close-btn'><span className='heng'/></div>
                        <div className='open-btn'>
                            <span className='heng'/><span className='shu'/>
                        </div>

                        <div className='name flex-1'>{ this.props.name }</div>
                    </div>

                    <div className={$class('btn f--hlc',{'hidden' :this.props.currentId !== this.props.id })}>
                        <div className='btn-name'>添加事件</div>
                        <div className='btn-icon'><span  className='heng'  /><span  className='shu' /></div>
                    </div>
                </div>

                <div className={$class('E--content',{'hidden' :this.props.currentId !== this.props.id })}>
                    {
                        this.props.event.map(content)
                    }
                </div>
            </div>
        );
    }
}

module.exports = Event;

