import React from 'react';
import cls from 'classnames';
import bridge from 'bridge';

import { Slider, Row, Col, Card, Button } from 'antd';
import WidgetStore from '../../stores/WidgetStore';
import WidgetActions from '../../actions/WidgetActions';
import VxSlider from '../VxSlider';

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
			hasHandle: false
		};
		this.onTimer = this.onTimer.bind(this);
		this.onWidgetClick = this.onWidgetClick.bind(this);
		this.onWidgetMouseUp = this.onWidgetMouseUp.bind(this);
		this.onWidgetMouseDown = this.onWidgetMouseDown.bind(this);
		this.onWidgetMouseMove = this.onWidgetMouseMove.bind(this);
		this.flag = 0;
		this.stepX = null;
		this.stepY = null;
	}

	componentDidMount() {
		this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	onStatusChange(widget) {
		//console.log('w2', widget);
		if(widget.hasOwnProperty('hasHandle')) {
			this.setState({
				hasHandle: widget.hasHandle
			});
			return;
		}
		if(widget.resetTrack || widget.selectWidget) {
			this.setState({
				hasHandle: false
			});
		}

		if (widget.selectWidget !== undefined) {
			const changed = {currentTrack:null};
			let node = widget.selectWidget;
			if (node) {
				node.children.map(item => {
					if (item.className === 'track') {
						changed.currentTrack = item;
					}
				});
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
	}

	onPause() {
		this.state.timerNode.node['pause']();
	}

	onTimerChange(value) {
		WidgetActions['resetTrack']();
		this.state.timerNode.node['seek'](value * this.state.timerNode.node['totalTime']);
		WidgetActions['syncTrack']();
		this.setState({currentTime:value});
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
		this.setState({
			hasHandle: false
		});
	}

	onAddOrDelete() {
		// 如果没有活动的轨迹
		if(this.state.currentTrack===null) return;

		// 如果有活动的时间断点
		if(this.state.hasHandle) {
			this.onDelete();
		} else {
			this.onAdd();
		}
	}

	selectNextBreakpoint() {

	}

	selectPrevBreakpoint() {

	}

	onWidgetClick(event) {
		event.preventDefault();
		event.stopPropagation();
	}

	onWidgetMouseUp(event) {
		event.preventDefault();
		event.stopPropagation();
		if(this.flag===1) {
			this.flag = 0;
			this.stepX = 0;
			this.stepY = 0;
		}
	}

	onWidgetMouseDown(event) {
		event.preventDefault();
		event.stopPropagation();
		if(this.flag===0) {
			this.flag = 1;
			this.stepX = event.clientX;
			this.stepY = event.clientY;
		}
	}

	onWidgetMouseMove(event) {
		if(this.flag===1) {
			let x = event.clientX - this.stepX;
			let y = event.clientY - this.stepY;
			console.log(x, y);
			this.setState({
				stepX: x > 37 ? x: 37,
				stepY: y < 0 ? y: 0
			});
		}
	}

	render() {
		let tracks = [];
		let index = 0;

		const getTracks = (node) => {
			if (node.className === 'track') {
				tracks.push(
					<VxSlider key={index++} max={1} step={0.001} 
						refTrack={node} refTimer={this.state.timerNode} 
						points={node.props.data} isCurrent={node === this.state.currentTrack} />);
			}
			node.children.map(item => getTracks(item));
		};

		//console.log('timerNode',this.state.timerNode)
		if (this.state.timerNode) {
			getTracks(this.state.timerNode);
		}
		//console.log('timerNode', this.state.timerNode);

		return (!this.state.timerNode) ? null :(
			<div id='TimelineView'
				onClick={this.onWidgetClick}
				onMouseUp={this.onWidgetMouseUp}
				onMouseDown={this.onWidgetMouseDown}
				onMouseMove={this.onWidgetMouseMove}
				style={{
					left: `${this.state.stepX}px`,
					bottom: `${-this.state.stepY}px`,
				}}>
				<div id='TimelineHeader' className='timeline-row f--h'>
					<div className='timline-column-left f--hlc'>
						<span id='TimelineTitle'>时间轴</span>
						<span id='TimelineNodeDuration' className={
							cls('f--h',{'active': this.state.currentTrack!=null})
						}>
							<button id='TimelineIndicator'
								className={cls({'active': this.state.currentTrack!=null})}></button>
							<input type='number' defaultValue={
								this.state.currentTrack === null ? 0.000 :
								this.state.currentTime }
								min={0.000}
								step={0.001}/>
							<span>s</span>
						</span>
					</div>
					<div className='timline-column-right' id='TimelineNodeAction'
						style={{
						 width: `${500+2}px`
						}}>
						<div>
							<button id='TimelineNodeActionPrev'
								onClick={this.selectNextBreakpoint.bind(this)}></button>
							<button id='TimelineNodeActionModify'
								className={cls(
									{'active': this.state.currentTrack!=null},
									{'delete': this.state.hasHandle}
								)}
								onClick={this.onAddOrDelete.bind(this)}></button>
							<button id='TimelineNodeActionNext'
								onClick={this.selectPrevBreakpoint.bind(this)}></button>
						</div>
					</div>
				</div>
				<div id='TimelineTool' className='timeline-row f--h'>
					<div id='TimelinePlay' className='timline-column-left'>
						<button id='TimelinePlayBegin'></button>
						<button id='TimelinePlayStart' onClick={this.onPlay.bind(this)}></button>
						<button id='TimelinePlayEnd'></button>
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
					<Slider max={1} step={0.001} value={this.state.currentTime} onChange={this.onTimerChange.bind(this)} />
					</div>
				</div>
				<div id='TimlineNodeContent'>
					<ul id='TimlineNodeList'>
					{tracks}
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
