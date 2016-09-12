import React, {Component, PropTypes} from 'react';
import cls from 'classnames';

class TimelineTrack extends React.Component {
	constructor(props) {
		super(props);
	}

	onChange() {
		//
	}

	render() {
		//console.log('props', this.props)
		//return <li></li>;
		let track = this.props.refTrack;
		return (
			<li className={
				cls(
				{'active': this.props.isCurrent},
				'timeline-row',
				'timeline-node',
				`timeline-node-${track.parent.className}`,
				'f--h')}>
				<div className='timeline-node-meta timline-column-left f--hlc'>
					<label className={cls('timeline-node-type', `timeline-node-type-${track.parent.className}`)} />
					<span className='timeline-node-name'>
					    {track.parent.className}
					</span>
				</div>
				<div className='timeline-node-track timline-column-right'>
				{
					this.props.points.map((point, index)=> {
						return <div key={index}
							className='timeline-node-track-breakpoint'
							style={{
							left : `${ point[0]*500 - 12 }px`
							}}></div>
					})
				}
				</div>
		</li>);
	}
};

TimelineTrack.propTypes = {
	refTrack: PropTypes.object.isRequired,
	refTimer: PropTypes.object.isRequired,
	points: PropTypes.array.isRequired,
	isCurrent: PropTypes.bool.isRequired
};

export default TimelineTrack;