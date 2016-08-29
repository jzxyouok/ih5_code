import React from 'react';
import cls from 'classnames';

// const Namespace = 'Timeline';
// const ns = (name)=> {id: `${Namespace}name`};

/**
 * 时间轴组件
 */
class TimelineView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeLine: null,
			activeTime: 1.6,
			timerNode: [{
				id: 1,
				name: '图片1',
				type: 'image',
				duration: {
					begin: 0,
					end: 2.500
				},
				breakpoints: [
					0.5, 1.2, 2.1
				]
			},{
				id: 2,
				name: '某某某按钮00000000',
				type: 'button',
				duration: {
					begin: 0.8,
					end: 6.500
				},
				breakpoints: [
					0.8, 2.7, 4.9, 5.5
				]
			},{
				id: 2,
				name: '某某某按钮0000000001111111111',
				type: 'button',
				duration: {
					begin: 0.8,
					end: 5.500
				},
				breakpoints: [
					0.5, 1.8, 3.3
				]
			}]
		};
	}

	componentDidMount() {

	}

	componentWillUnmount() {

	}

	nodeSelect() {

	}

	breakpointSelect() {
		
	}

	breakpointChange() {

	}

	breakpointAdd() {

	}

	breakpointRemove() {

	}

	playTrack() {

	}

	render() {
		return (
			<div id='TimelineView'>
				<div id='TimelineHeader' className='timeline-row f--h'>
					<div className='timline-column-left f--hlc'>
						<span id='TimelineTitle'>时间轴</span>
						<span id='TimelineNodeDuration' className={
							cls('f--h', {'active': this.state.activeLine!=null})
						}>
							<button id='TimelineIndicator'
								className={cls({'active': this.state.activeLine!=null})}></button>
							<input type='number' defaultValue={
								this.state.activeLine === null ? 0.000 :
								this.state.timerNode[this.state.activeLine].time }
								min={0.000}
								step={0.001}/>
							<span>s</span>
						</span>
					</div>
					<div className='timline-column-right' id='TimelineNodeAction'>
						<div>
							<button id='TimelineNodeActionPrev'></button>
							<button id='TimelineNodeActionModify'
								className={cls({'active': this.state.activeLine!=null})}></button>
							<button id='TimelineNodeActionNext'></button>
						</div>
					</div>
				</div>
				<div id='TimelineTool' className='timeline-row f--h'>
					<div id='TimelinePlay' className='timline-column-left'>
						<button id='TimelinePlayBegin'></button>
						<button id='TimelinePlayStart'></button>
						<button id='TimelinePlayEnd'></button>
					</div>
					<div id='TimelineRuler' className='timline-column-right'>
						<div id="TimelineRulerNumbers"></div>
						<div id="TimelineRulerMap"></div>
						<div id='TimelineRulerSlide' style={{
							left: `${this.state.activeTime * 100 - 13}px`
						}}></div>
					</div>
				</div>
				<div id='TimlineNodeContent'>
					<div id='TimelineRulerAlign' style={{
						left: `${180 + this.state.activeTime * 100}px`
					}}></div>
					<ul id='TimlineNodeList'>
					{
						this.state.timerNode.map((node, index)=> {
							return <li className={cls(
								{'active': this.state.activeLine===node.id},
								'timeline-row',
								'timeline-node',
								`timeline-node-${node.type}`,
								'f--h')} key={index}>
								<div className='timeline-node-meta timline-column-left f--hlc'>
									<label className={cls('timeline-node-type', `timeline-node-type-${node.type}`)} />
									<span className='timeline-node-name'>
									{node.name}
									</span>
								</div>
								<div className='timeline-node-track timline-column-right'>
								{
									node.breakpoints.map((point, index)=> {
										return <div key={index}
											className='timeline-node-track-breakpoint'
											style={{
											left : `${point*100}px`
											}}></div>
									})
								}
								</div>
							</li>
						})
					}
					</ul>
				</div>
			</div>
		);
	}

}


module.exports = TimelineView;
