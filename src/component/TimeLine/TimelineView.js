import React from 'react';
import cls from 'classnames';
import bridge from 'bridge';

import { Slider, Row, Col, Card, Button } from 'antd';
import WidgetStore from '../../stores/WidgetStore';
import WidgetActions from '../../actions/WidgetActions';
import TimelineStores from '../../stores/Timeline';
import TimelineAction from '../../actions/TimelineAction';

import VxSlider from '../VxSlider';
import ComponentPanel from '../ComponentPanel';

var timerCallback = {};

/**
 * 时间轴组件
 */
class TimelineView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			currentTime: 0,
			currentTrack: null,
			timerNode: null,
			stepX: 37,
			stepY: 0,
			//hasHandle: false,
			isPlaying: false,
            selectLayerData : null,
            inputState : false,
            inputTime : null,
            isChangeKey : false
		};
		this.onTimer = this.onTimer.bind(this);
		//this.onWidgetClick = this.onWidgetClick.bind(this);
		//this.onWidgetMouseUp = this.onWidgetMouseUp.bind(this);
		//this.onWidgetMouseDown = this.onWidgetMouseDown.bind(this);
		//this.onWidgetMouseMove = this.onWidgetMouseMove.bind(this);
		this.flag = 0;
		this.stepX = null;
		this.stepY = null;

        this.onPlay = this.onPlay.bind(this);
        this.onPause = this.onPause.bind(this);
        this.onPlayOrPause = this.onPlayOrPause.bind(this);
        this.formatter = this.formatter.bind(this);
        this.timeInput = this.timeInput.bind(this);
        this.timeInputSure = this.timeInputSure.bind(this);
	}

	componentDidMount() {
		this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
        TimelineStores.listen(this.ChangeKeyframe.bind(this));
	}

	componentWillUnmount() {
		this.unsubscribe();
        TimelineStores.removeListener(this.ChangeKeyframe);
	}

	onStatusChange(widget) {
		//console.log('w2', widget);
		//if(widget.hasOwnProperty('hasHandle')) {
		//	this.setState({
		//		hasHandle: widget.hasHandle
		//	});
		//	return;
		//}
		//if(widget.resetTrack || widget.selectWidget) {
		//	this.setState({
		//		hasHandle: false
		//	});
		//}

		if (widget.selectWidget !== undefined) {
			const changed = {currentTrack:null};
			let node = widget.selectWidget;
			if (node) {
				node.children.map(item => {
					if (item.className === 'track') {
						changed.currentTrack = item;
					}
				});

                if(node.className === 'track'){
                    changed.currentTrack = node;
                }
                //console.log(changed.currentTrack);
			}
			if (node)
				node = node.timerWidget;
			if (node !== this.state.timerNode) {
				if (node) {
					bridge.timerAddCallback(node.node, timerCallback, this.onTimer);
				} else {
					if (this.state.timerNode)
						bridge.timerRemoveCallback(this.state.timerNode.node, timerCallback);
				}
				changed.timerNode = node;
			}
			this.setState(changed);
		}
		if (widget.updateTrack !== undefined) {
			if (widget.updateTrack !== null && widget.updateTrack.timerWidget === this.state.timerNode) {
				this.setState({currentTrack: widget.updateTrack});
			} else {
				this.setState({currentTrack: null});
			}
		}
	}

	onTimer(p) {
		this.setState({currentTime:p});
		WidgetActions['syncTrack']();
	}

	onPlay() {
		WidgetActions['resetTrack']();
		this.state.timerNode.node['play']();
		this.setState({isPlaying:true});
	}

	onPause() {
		this.state.timerNode.node['pause']();
		this.setState({isPlaying:false});
	}

	onPlayOrPause() {
		this.state.isPlaying?this.onPause():this.onPlay();
	}

	onTimerChange(value) {
		WidgetActions['resetTrack']();
		this.state.timerNode.node['seek'](value * this.state.timerNode.node['totalTime']);
		WidgetActions['syncTrack']();
        //console.log(value);
		this.setState({currentTime:value});
        TimelineAction['ChangeKeyframe'](false,value);
	}

    ChangeKeyframe(data){
        //console.log(data);
       this.setState({
           isChangeKey : data
       })
    }

	// 添加时间断点
	onAdd() {
		if (this.state.currentTrack) {
			let p = this.state.currentTime;
			let data = this.state.currentTrack.props['data'];
			let index = 0;
			while (index < data.length && p >= data[index][0]) {
				index++;
			}
			let d = [p];
			let prop = this.state.currentTrack.props['prop'];
			let parent = this.state.currentTrack.parent;
			for (let i = 0; i < prop.length; i++) {
				d.push(parent.node[prop[i]]);
			}
			data.splice(index, 0, d);
			this.state.currentTrack.node['data'] = data;
			this.forceUpdate();
		}
	}

	// 删除时间断点
	onDelete() {
		WidgetActions['deletePoint']();
		//this.setState({
		//	hasHandle: false
		//});
        TimelineAction['ChangeKeyframe'](false);
	}

	onAddOrDelete() {
		// 如果没有活动的轨迹
		if(this.state.currentTrack===null) return;

		// 如果有活动的时间断点
		if(this.state.isChangeKey) {
			this.onDelete();
		} else {
			this.onAdd();
		}
	}

    formatter(value){
        let data = value;
        //data = data.toFixed(4);
        if(this.state.isPlaying && this.state.timerNode){
            let totalTime = this.state.timerNode.node['totalTime'];
            if(data == totalTime/10){
                this.setState({
                    isPlaying: false
                })
            }
        }
        return (data * 10).toFixed(2);
    }

    timeInput(){
        let data = this.refs.TimeInput.value;
        this.setState({
            inputState : true,
            inputTime : data
        });
    }

    timeInputSure(event){
        //console.log(event.key);
        let data = this.refs.TimeInput.value;
        let max = parseInt(event.currentTarget.getAttribute("data-max"));
        if(event.key == "Enter"){
            if(data > max){
                data = max;
            }
            this.setState({
                inputState : false,
                currentTime : parseFloat(data) / 10
            });
            if(this.state.isChangeKey){
                TimelineAction['ChangeKeyframe'](true,parseFloat(data) / 10);
            }
        }
        else if(event.key == "ArrowUp"){
            this.setState({
                inputState : true,
                inputTime : parseFloat(data) + 0.01
            });
        }
        else if(event.key == "ArrowDown" && parseFloat(data) !== 0){
            this.setState({
                inputState : true,
                inputTime : parseFloat(data) - 0.01
            });
        }
    }

	selectNextBreakpoint() {

	}

	selectPrevBreakpoint() {

	}

	//onWidgetClick(event) {
	//	event.preventDefault();
	//	event.stopPropagation();
	//}
    //
	//onWidgetMouseUp(event) {
	//	event.preventDefault();
	//	event.stopPropagation();
	//	if(this.flag===1) {
	//		this.flag = 0;
	//		this.stepX = 0;
	//		this.stepY = 0;
	//	}
	//}
    //
	//onWidgetMouseDown(event) {
	//	event.preventDefault();
	//	event.stopPropagation();
	//	if(this.flag===0) {
	//		this.flag = 1;
	//		this.stepX = event.clientX;
	//		this.stepY = event.clientY;
	//	}
	//}
    //
	//onWidgetMouseMove(event) {
	//	if(this.flag===1) {
	//		let x = event.clientX - this.stepX;
	//		let y = event.clientY - this.stepY;
	//		// console.log(x, y);
	//		this.setState({
	//			stepX: x > 37 ? x: 37,
	//			stepY: y < 0 ? y: 0
	//		});
	//	}
	//}

	render() {
        let tracks = [];
        let index = 0;
        let totalTime = 10;
        //console.log('timerNode', this.state.timerNode);

        const getTracks = (node) => {
            if (node.className === 'track') {
                let pic = null;
                this.refs.ComponentPanel.panels[0].cplist.map((v1,i2)=>{
                    if (v1.className === node.parent.className){
                        pic = v1.icon;
                    }
                });
                tracks.push(
                    <VxSlider
                        key={index++}
                        max={1}
                        step={0.001}
                        refTrack={node}
                        pic={pic}
                        width={61 * totalTime}
                        refTimer={this.state.timerNode}
                        points={node.props.data}
                        myID = { node.parent.key }
                        isCurrent={node === this.state.currentTrack} />);
            }
            node.children.map(item => getTracks(item));
        };

        if (this.state.timerNode && this.refs.ComponentPanel) {
            getTracks(this.state.timerNode);

            if(this.state.timerNode.props.totalTime){
                totalTime = this.state.timerNode.props.totalTime;
            }
        }

        let unit = (data)=>{
            let arry = [];
            for(let i=1; i<=data; i++){
                arry.push(i);
            }
            return arry.map((v,i)=>{
                return <li key={i}><span>{ v >= 10 || v == 0 ? v + 's' : '0'+ v + 's' }</span></li>;
            });
        };

        return (
            <div id='TimelineView' className={ cls({"hidden":!this.state.timerNode })}>
                <div className="hidden">
                    <ComponentPanel ref="ComponentPanel" />
                </div>

                <div id='TimelineHeader' className='timeline-row f--h'>
                    <div className='timline-column-left f--hlc'>
                        <div id='TimelineTitle'>时间轴</div>
                        <div id='TimelineNodeDuration' className={
                        cls('f--hlc flex-1',{'active': this.state.currentTrack!=null})
                    }>
                        <span id='TimelineIndicator'
                              className={cls({'active': this.state.currentTrack!=null})} />
                            <input type='text'
                                   value={ this.state.inputState ?  this.state.inputTime :(this.state.currentTime * 10).toFixed(2) }
                                   onChange={ this.timeInput.bind(this) }
                                   onKeyDown = { this.timeInputSure.bind(this)}
                                   data-max = {totalTime}
                                   ref="TimeInput"/>
                            <span>s</span>
                        </div>
                    </div>

                    <div className='timline-column-right flex-1' id='TimelineNodeAction'>
                        <div>
                            <button id='TimelineNodeActionPrev'
                                    onClick={this.selectNextBreakpoint.bind(this)} />
                            <button id='TimelineNodeActionModify'
                                    className={cls(
                                        {'active': this.state.currentTrack!=null},
                                        {'delete': this.state.isChangeKey}
                                    )}
                                    onClick={this.onAddOrDelete.bind(this)} />
                            <button id='TimelineNodeActionNext'
                                    onClick={this.selectPrevBreakpoint.bind(this)} />
                        </div>
                    </div>
                </div>

                <div id='TimelineTool' className='timeline-row f--h'>
                    <div id='TimelinePlay' className='timline-column-left'>
                        <button id='TimelinePlayBegin' />
                        {/*<button id='TimelinePlayStart' onClick={this.onPlay.bind(this)}></button>*/}
                        <button id={!this.state.isPlaying?'TimelinePlayStart':'TimelinePlayPause'}
                                onClick={this.onPlayOrPause} />

                        <button id='TimelinePlayEnd' />

                        <span className="line" />
                    </div>

                    <div id='TimelineRuler' className='timline-column-right'>
                        {
                            // <div id="TimelineRulerNumbers">
                            // </div>
                            // <div id="TimelineRulerMap"></div>
                            // <div id='TimelineRulerSlide' style={{
                            // 	left: `${this.state.currentTime * 100 - 13}px`
                            // }}></div>
                        }
                        <span className="unit-0">0s</span>

                        <ul className="unit" style={{ width : 61 * totalTime +"px" }}>
                            { unit(totalTime) }
                        </ul>

                        <div style={{ width : 61 * totalTime +"px" }}>
                            <Slider max={1}
                                    step={0.001}
                                    value={this.state.currentTime}
                                    tipFormatter={  this.formatter  }
                                    onChange={this.onTimerChange.bind(this)} />
                        </div>

                        <span className="flex-1" />
                    </div>
                </div>
                <div id='TimlineNodeContent'>
                    <ul id='TimlineNodeList'>
                        {
                            tracks
                        }

                        {
                            // this.state.timerNode.map((node, index)=> {
                            // 	return <TimelineTrack track={node} key={index} />
                            // })
                        }
                    </ul>
                </div>
            </div>
		);
	}

}


module.exports = TimelineView;
