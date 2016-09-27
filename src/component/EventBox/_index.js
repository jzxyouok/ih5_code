//事件属性框
import React from 'react';
import $class from 'classnames';
import Event from './Event';
import {eventTempData} from './tempData';
import WidgetStore from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'

class EventBox extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            keepIt : false,
            activeKey: 1,
            selectWidget: null
        };
        this.eventData = eventTempData;

        this.chooseEventBtn = this.chooseEventBtn.bind(this);
        this.keepBtn = this.keepBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if(widget.selectWidget){
            this.setState({
                selectWidget: widget.selectWidget
            });
        }
        //TODO: uncomment
        // if(widget.activeEventTreeKey) {
        //     this.setState({
        //         activeKey: widget.activeEventTreeKey.key
        //     });
        // }
    }

    chooseEventBtn(nid, data){
        this.setState({
            activeKey: nid
        });

        //TODO: uncomment
        // if(this.state.activeKey !== nid) {
        //     //触发选择widget并选择当前event
        //     WidgetActions['selectWidget'](data.widget);
        //     WidgetActions['activeEventTree'](nid);
        // }
    }

    keepBtn(){
        this.setState({
            keepIt : !this.state.keepIt
        })
    }

    render() {
        return (
            <div className={$class('EventBox',{'keep':this.state.keepIt}, {'hidden':this.props.isHidden})}
                 style={{ left : this.props.expanded? '65px':'37px'}}>
                <div className='EB--title f--hlc'>
                    <span className='flex-1'>事件属性</span>
                    <button className='btn btn-clear' title='收起' onClick={this.keepBtn} />
                </div>

                <div className='EB--content-layer'>
                    <div className='EB--content'>
                        {
                            this.eventData.map((v,i)=>{
                                return <Event key={i} {...v} wKey={v.key} activeKey={this.state.activeKey} chooseEventBtn={this.chooseEventBtn.bind(this, v.key, v)} />
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = EventBox;
