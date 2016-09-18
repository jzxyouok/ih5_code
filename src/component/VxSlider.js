import React from 'react';
import classNames from 'classnames';
import RcSlider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import Track from 'rc-slider/src/Track';
import Steps from 'rc-slider/src/Steps';
import Marks from 'rc-slider/src/Marks';
import cls from 'classnames';

import WidgetStore from '../stores/WidgetStore';
import WidgetActions from '../actions/WidgetActions';

import TimelineStores from '../stores/Timeline';
import TimelineAction from '../actions/TimelineAction';

function noop() {
}

class VxHandle extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isTooltipVisible: false
        };
    }

    showTooltip() {
        this.setState({
            isTooltipVisible: true
        });
        //TimelineAction['ChangeKeyframe'](true);
    }

    hideTooltip() {
        this.setState({
          isTooltipVisible: false
        });
    }

    onHandleClick(event) {
        //event.stopPropagation();
        //event.preventDefault();
        this.props.onHandleClick(this);
    }

  render() {
    const props = this.props;
    const {className, tipTransitionName, tipFormatter, vertical, offset, value, isCurrent} = props;
    const {dragging, noTip} = props;

    const style = vertical ? { bottom: offset + '%' } : { left: offset + '%' };

	let classNames = className;
    if (isCurrent) {
        //style['border'] = 'solid 2px #E00';
		classNames = classNames + ' active';
	}
    const handle = (<div className={classNames} style={style}
                      onMouseUp={this.showTooltip.bind(this)}
                      onMouseEnter={this.showTooltip.bind(this)}
                      onMouseLeave={this.hideTooltip.bind(this)}
                      onMouseDown={this.onHandleClick.bind(this)} />);

    if (noTip) {
      return handle;
    }

    const isTooltipVisible = dragging || this.state.isTooltipVisible;
    return (<Tooltip
              prefixCls={className.replace('slider-handle', 'tooltip')}
              placement="top"
              visible={isTooltipVisible}
              overlay={<span>{tipFormatter(value)}</span>}
              delay={0}
              transitionName={tipTransitionName}>
              {handle}
            </Tooltip>);
  }
}

/*
function getMousePosition(vertical, e) {
  return vertical ? e.clientY : e.pageX;
}
*/

function pauseEvent(e) {
  e.stopPropagation();
  e.preventDefault();
}

// 轨迹 的 组件
class VxRcSlider extends RcSlider {
    constructor(props) {
        super(props);
        this.state = {
            points: this.props.points,
            currentHandle: -1,
            changeKey : null,
            changeKeyBool : false,
            changeKeyValue : null,
            isChooseKey : false,
            lastLayer : null,
            nowLayer:null
        };
        this.onHandleClick = this.onHandleClick.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.selectTrack = this.selectTrack.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
        TimelineStores.listen(this.ChangeKeyframe.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
        TimelineStores.removeListener(this.ChangeKeyframe);
    }

    ChangeKeyframe(bool,value){
        //console.log('key',bool,value);
        if(bool){
            if(value){
                this.setState({
                    changeKeyBool : bool,
                    changeKeyValue : value
                });
            }
        }
    }

    selectTrack(){
        //console.log(this.props.refTrack);
        WidgetActions['selectWidget'](this.props.refTrack.parent, true);
    }

    onHandleClick(handle) {
        this.selectTrack();
        this.props.refTimer.node['pause']();
        this.props.refTimer.node['seek'](
            this.props.refTrack.props['data'][handle.props.handleIndex][0]
            * this.props.refTimer.node['totalTime']
        );
        this.state.currentHandle = handle.props.handleIndex;
        TimelineAction['ChangeKeyframe'](true);
        //WidgetActions['activeHandle'](true);
        WidgetActions['syncTrack']();
        this.setState({
            changeKeyValue : null,
            changeKey : handle.props.handleIndex,
            isChooseKey : true
        });
        //if (this.props.isCurrent) {
        //    this.props.refTimer.node['pause']();
        //    this.props.refTimer.node['seek'](
        //        this.props.refTrack.props['data'][handle.props.handleIndex][0]
        //        * this.props.refTimer.node['totalTime']
        //    );
        //    this.state.currentHandle = handle.props.handleIndex;
        //    //WidgetActions['activeHandle'](true);
        //
        //    WidgetActions['syncTrack']();
        //    this.setState({
        //        changeKeyValue : null,
        //        changeKey : handle.props.handleIndex,
        //        isChooseKey : true
        //    })
        //}
        //else {
        //    this.setState({
        //        currentHandle: -1,
        //        changeKey : null,
        //        changeKeyBool : false,
        //        changeKeyValue : null
        //    })
        //}
    }

    onMove(e, position) {
        TimelineAction['ChangeKeyframe'](false);
        this.setState({
            changeKeyBool : false
        });
        pauseEvent(e);
        const props = this.props;

        if (this.state.currentHandle >= 0) {
            let diffPosition = position - this.startPosition;
            diffPosition = this.props.vertical ? -diffPosition : diffPosition;
            const diffValue = diffPosition / this.getSliderLength() * (props.max - props.min);

            const value = this.trimAlignValue(this.startValue + diffValue);

            let points = this.state.points;
            points[this.state.currentHandle][0] = value;
            this.props.refTrack.props['data'] = this.props.refTrack.node['data'] = points;
            this.props.refTimer.node['seek'](value * this.props.refTimer.node['totalTime']);
            this.setState({points: points});
        }
    }

    onStatusChange(widget) {
        //console.log(widget);
        if (widget.resetTrack !== undefined) {
            this.setState({currentHandle: -1});
        }
        if (widget.updateProperties !== undefined && widget.skipRender === undefined && this.state.currentHandle >= 0) {
            let obj = widget.updateProperties;
            let points = this.state.points;
            let props = this.props.refTrack.props['prop'];
            for (let i = 0; i < props.length; i++) {
                if (obj[props[i]] !== undefined)
                    points[this.state.currentHandle][i + 1] = obj[props[i]];
            }
        }
        if (widget.syncTrack !== undefined && this.props.isCurrent) {
            let props = this.props.refTrack.props['prop'];
            let obj = {};
            for (let i = 0; i < props.length; i++) {
                obj[props[i]] = this.props.refTrack.parent.node[props[i]];
            }
            WidgetActions['updateProperties'](obj, true);
        }
        if (widget.deletePoint !== undefined && this.props.isCurrent && this.state.currentHandle >= 0 && this.state.points.length >= 2) {
            let points = this.state.points;
            points.splice(this.state.currentHandle, 1);
            this.props.refTrack.props['data'] = this.props.refTrack.node['data'] = points;
            this.setState({currentHandle: -1, points: points});
        }
        if(widget.selectWidget){
            //console.log(widget.selectWidget);
            if(this.state.isChooseKey){
                let test = widget.selectWidget.key;
                this.setState({
                    isChooseKey : false,
                    lastLayer : test
                })
            }
            this.setState({
                nowLayer : widget.selectWidget.key
            },()=>{
                if(this.state.lastLayer !== this.state.nowLayer ){
                    this.setState({
                        currentHandle: -1
                    });
                }
            });
        }
    }

    componentWillReceiveProps() {
    }

  	render() {
        const {points} = this.state;
		const {className, prefixCls, disabled, vertical, dots, included, range, step,
			marks, max, min, tipTransitionName, tipFormatter, children} = this.props;

		const handleClassName = prefixCls + '-handle';
		const isNoTip = (step === null) || (tipFormatter === null);

        let handles = [];
        const lowerBound = points[0][0];
        const upperBound = points[points.length - 1][0];
        const upperOffset = this.calcOffset(upperBound);
        const lowerOffset = this.calcOffset(lowerBound);

        for (let i = 1; i < points.length; i++) {
            let offset = this.calcOffset(points[i][0]);
            let which = this.state.changeKey;
            let isCurrentBool = false;
            if(this.props.myID === this.state.nowLayer ){
                if(this.state.changeKeyBool){
                    if(this.state.changeKeyValue){
                        if(which === i) {
                            points[which][0] = this.state.changeKeyValue;
                            let position = points[which][0];
                            offset = this.calcOffset(position);
                        }
                        else {
                            offset = this.calcOffset(points[i][0])
                        }
                    }
                }
                if(this.state.currentHandle == i){
                    isCurrentBool = true;
                }
                else {
                    isCurrentBool = false;
                }
            }

            handles.push(<VxHandle
                className={handleClassName}
                noTip={isNoTip}
                tipTransitionName={tipTransitionName}
                tipFormatter={tipFormatter}
                vertical={vertical}
                offset={offset}
                value={points[i][0]}
                dragging={false}
                isCurrent={isCurrentBool}
                key={i}
                handleIndex={i}
                onHandleClick={this.onHandleClick} />)
        }

		const sliderClassName = classNames({
			[prefixCls]: true,
			[prefixCls + '-disabled']: disabled,
			[className]: !!className,
			[prefixCls + '-vertical']: this.props.vertical
		});
		const isIncluded = included || range;

        const style = {};
        style['width']= this.props.width;
        if (this.props.isCurrent){
            style['borderColor'] = '#CCC';
        }
        //console.log(this.props.refTrack);

        let track = this.props.refTrack;
        let trackClass = track.parent.className;

        if(trackClass == "image" || trackClass == "imagelist"){
            style['backgroundColor'] = '#386d6a';
        }
        else if(trackClass == "text" || trackClass == "bitmaptext"){
            style['backgroundColor'] = '#937c3f';
        }
        else if(trackClass == "rect" || trackClass == "ellipse" || trackClass == "path"){
            style['backgroundColor'] = '#9c5454';
        }
        else if(trackClass == "button" || trackClass == "transbutton"){
            style['backgroundColor'] = '#405b83';
        }
        else {
            style['backgroundColor'] = '#764a8f';
        }

        //console.log(track);
        //console.log(this.props.myID ,this.state.nowLayer);
		return (
			<li className={
				cls(
				{'active': this.props.myID === this.state.nowLayer},
				'timeline-row',
				'timeline-node',
				`timeline-node-${track.parent.className}`,
				'f--hlc')}>
				<div className='timeline-node-meta timline-column-left f--hlc'>
                    {
                        //<label className={cls('timeline-node-type', `timeline-node-type-${track.parent.className}`)} />
                    }
                    <img src={ this.props.pic } className="timeline-node-type" />

					<span className='timeline-node-name'>{track.parent.className}</span>
				</div>

				<div className='timeline-node-track timline-column-right'>
					<div ref="slider" className={sliderClassName} style={style}
                            onClick={ this.selectTrack }
							onTouchStart={disabled ? noop : this.onTouchStart.bind(this)}
							onMouseDown={disabled ? noop : this.onMouseDown.bind(this)} data-name='slider'>
						{handles}

						<Track className={prefixCls + '-track'}
                               vertical = {vertical}
                               included={isIncluded}
                               offset={lowerOffset}
                               length={upperOffset - lowerOffset}
                                />

						<Steps prefixCls={prefixCls}
                               vertical = {vertical}
                               marks={marks}
                               dots={dots}
                               step={step}
                               included={isIncluded}
                               lowerBound={lowerBound}
                               upperBound={upperBound}
                               max={max}
                               min={min}/>

						<Marks className={prefixCls + '-mark'}
                               vertical = {vertical}
                               marks={marks}
                               included={isIncluded}
                               lowerBound={lowerBound}
                               upperBound={upperBound}
                               max={max}
                               min={min}/>

						{children}
					</div>
				</div>
			</li>
		);
	}
}

class VxSlider extends React.Component {
	render() {
        //console.log('props: ', this.props);
		return <VxRcSlider {...this.props} />;
	}
}

VxSlider.defaultProps = {
	prefixCls: 'ant-slider',
	tipTransitionName: 'zoom-down'
};

export default VxSlider;
