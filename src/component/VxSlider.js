import React from 'react';
import classNames from 'classnames';
import RcSlider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import Track from 'rc-slider/src/Track';
import Steps from 'rc-slider/src/Steps';
import Marks from 'rc-slider/src/Marks';
import cls from 'classnames';
import $ from 'jquery';

import WidgetStore from '../stores/WidgetStore';
import WidgetActions from '../actions/WidgetActions';
import TimelineStores from '../stores/Timeline';
import TimelineAction from '../actions/TimelineAction';
import ChangeKeyStore from '../stores/ChangeKeyStore';
import changeKeyAction from '../actions/changeKeyAction';

import bridge from 'bridge';

function noop() {
}

let isCleanKeyValue = false;

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
        this.props.selectTrack();
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
                      onMouseDown={this.onHandleClick.bind(this)}>
                    </div>);
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
            nowLayer:null,
            dragLeft : 0,
            dragRight : 0,
            isDragTrackLeft : false,
            isDragTrackRight : false
        };
        this.onHandleClick = this.onHandleClick.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.selectTrack = this.selectTrack.bind(this);
        this.lastOrNext = this.lastOrNext.bind(this);
        this.initializationState= this.initializationState.bind(this);
        this.isHaveTrunBtn = this.isHaveTrunBtn.bind(this);
        this.dragLeftBtn = this.dragLeftBtn.bind(this);
        this.dragRightBtn = this.dragRightBtn.bind(this);

        this.trackSelect = this.trackSelect.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
        TimelineStores.listen(this.ChangeKeyframe.bind(this));
        ChangeKeyStore.listen(this.ChangeKey.bind(this));
        this.initializationState();
        this.dragLeftBtn();
        this.dragRightBtn();
    }

    componentWillUnmount() {
        this.unsubscribe();
        //TimelineStores.removeListener(this.ChangeKeyframe.bind(this));
        //ChangeKeyStore.removeListener(this.ChangeKey.bind(this));
    }

    initializationState(){
        this.setState({
            points: this.props.points,
            currentHandle: -1,
            changeKey : null,
            changeKeyBool : false,
            changeKeyValue : null,
            isChooseKey : false,
            lastLayer : null,
            nowLayer:null
        });
    }

    ChangeKeyframe(bool,value){
        //console.log('key',bool,value,which);
        if(bool){
            if(value !== undefined){
                if(value || value==0){
                    isCleanKeyValue = true;
                    this.setState({
                        changeKeyBool : bool,
                        changeKeyValue : value
                    });
                }
            }
        }
    }

    lastOrNext(){
        if(this.props.myID === this.state.nowLayer){
            this.props.refTimer.node['pause']();
            this.props.refTimer.node['seek'](
                this.props.refTrack.props['data'][this.state.currentHandle][0]
            );
            //console.log(1,true)
            TimelineAction['ChangeKeyframe'](true);
            changeKeyAction['ChangeKey'](false);
        }
    }

    isHaveTrunBtn(bool,num){
        if(bool){
            if(num === 0){
                this.props.changSwitchState(0);
            }
            else if(this.state.currentHandle === num){
                this.props.changSwitchState(1);
            }
            else if(this.state.currentHandle === 0){
                this.props.changSwitchState(-1);
            }
            else {
                this.props.changSwitchState(2);
            }
        }
        else {
            if(this.props.myID === this.state.nowLayer){
                if(num === 0){
                    this.props.changSwitchState(0);
                }
                else if(this.state.currentHandle === num){
                    this.props.changSwitchState(1);
                }
                else if(this.state.currentHandle === 0){
                    this.props.changSwitchState(-1);
                }
                else {
                    this.props.changSwitchState(2);
                }
            }
        }
    }

    ChangeKey(bool,value){
        if(bool){
            let num = this.props.refTrack.props.data.length -1;
            if(value == 1 && this.state.currentHandle < num){
                this.setState({
                    currentHandle: this.state.currentHandle +1,
                    changeKey: this.state.currentHandle +1,
                    changeKeyBool : false
                },()=>{
                    this.lastOrNext();
                    this.isHaveTrunBtn(false,num);
                })
            }
            else if(value == -1 &&this.state.currentHandle > 0){
                this.setState({
                    currentHandle: this.state.currentHandle -1,
                    changeKey: this.state.currentHandle -1,
                    changeKeyBool : false
                },()=>{
                    this.lastOrNext();
                    this.isHaveTrunBtn(false,num);
                })
            }
            else {
                this.isHaveTrunBtn(false,num);
                this.setState({
                    changeKeyBool : true
                });
                //TimelineAction['ChangeKeyframe'](true);
            }
        }
    }

    selectTrack(){
        //console.log(2,false);
        TimelineAction['ChangeKeyframe'](false);
        WidgetActions['selectWidget'](this.props.refTrack.parent, true);
        //console.log(123);
        this.setState({
            currentHandle: -1,
            changeKey : null,
            changeKeyBool : false,
            changeKeyValue : null
        },()=>{
            this.isHaveTrunBtn(false,0);
        });

        this.dragLeftBtn();
        this.dragRightBtn();
    }

    onHandleClick(handle) {
        //console.log(this.props.refTrack.props['data']);
        this.props.refTimer.node['pause']();
        this.props.refTimer.node['seek'](
            this.props.refTrack.props['data'][handle.props.handleIndex][0]
        );
        //console.log(456);
        this.setState({
            currentHandle : handle.props.handleIndex,
            changeKeyValue : null,
            changeKey : handle.props.handleIndex,
            isChooseKey : true,
            changeKeyBool : true
        },()=>{
            WidgetActions['syncTrack']();
            this.isHaveTrunBtn(true,this.props.refTrack.props.data.length -1);
            //console.log(3,true);
            TimelineAction['ChangeKeyframe'](true,undefined,handle.props.handleIndex);
            this.forceUpdate();
        });
    }

    onMove(e, position) {
        //console.log(4,false);
        //TimelineAction['ChangeKeyframe'](false);
        //this.setState({
        //    changeKeyBool : false
        //});
        pauseEvent(e);
        const props = this.props;
        if (this.state.currentHandle >= 0) {
            let diffPosition = position - this.startPosition;
            diffPosition = this.props.vertical ? -diffPosition : diffPosition;
            const diffValue = diffPosition / this.getSliderLength() * (props.max - props.min);

            let value = this.trimAlignValue(this.startValue + diffValue);
            let points = this.props.points;

            //let startTime = this.props.refTrack.node.startTime;
            //let endTime = this.props.refTrack.node.endTime;
            //if(startTime){
            //    if(value < startTime){
            //        value = startTime;
            //    }
            //}
            //if(endTime){
            //    if(value > endTime){
            //        value = endTime;
            //    }
            //}
            points[this.state.currentHandle][0] = value;
            this.props.refTrack.props['data'] = this.props.refTrack.node['data'] = points;
            this.props.refTimer.node['seek'](value);
            //this.props.refTimer.node['seek'](value * this.props.refTimer.node['totalTime']);
            this.setState({changeKeyBool : true});
        }
        //console.log(5,true);
        //this.setState({
        //    changeKeyBool : true
        //});
        //TimelineAction['ChangeKeyframe'](true);
    }

    onStatusChange(widget) {
        //console.log(widget);
        if (widget.resetTrack !== undefined) {
            this.setState({currentHandle: -1});
        }
        if(widget.updateProperties){
            if(widget.updateProperties.startTime){
                this.setState({
                    isDragTrackLeft : false
                })
            }
            if(widget.updateProperties.endTime){
                this.setState({
                    isDragTrackRight : false
                })
            }
        }
        if (widget.updateProperties !== undefined && widget.skipRender === undefined && this.props.isCurrent && this.state.currentHandle >= 0) {
            let obj = widget.updateProperties;
            let points = this.props.points;
            let props = this.props.refTrack.props['prop'];
            for (let i = 0; i < props.length; i++) {
                if (obj[props[i]] !== undefined)
                    points[this.state.currentHandle][i + 1] = obj[props[i]];
            }
            bridge.showTrack(this.props.refTrack.node, this.trackSelect);
        }
        if (widget.syncTrack !== undefined && this.props.isCurrent) {
            let props = this.props.refTrack.props['prop'];
            let obj = {};
            for (let i = 0; i < props.length; i++) {
                obj[props[i]] = this.props.refTrack.parent.node[props[i]];
            }
            WidgetActions['updateProperties'](obj, true, false, false);
        }
        if (widget.deletePoint !== undefined && this.props.isCurrent && this.state.currentHandle >= 0 && this.props.points.length >= 1) {
            let points = this.props.points;
            points.splice(this.state.currentHandle, 1);
            this.props.refTrack.props['data'] = points;
            this.props.refTrack.node['data'] = points;
            this.setState({currentHandle: -1});
            bridge.showTrack(this.props.refTrack.node, this.trackSelect);
            let historyName = "删除关键帧" + this.props.refTrack.parent.props.name;
            WidgetActions['updateHistoryRecord'](historyName);
        }
        if(widget.selectWidget){
            //console.log(widget.selectWidget);
            if(this.state.isChooseKey){
                let test = widget.selectWidget.key;
                this.setState({
                    isChooseKey : false,
                    lastLayer : test
                });
            }
            this.setState({
                nowLayer : widget.selectWidget.key
            },()=>{
                if(this.state.lastLayer !== this.state.nowLayer ){
                    this.setState({
                        currentHandle: -1,
                        changeKey : null,
                        changeKeyBool : false,
                        changeKeyValue : null
                    },()=>{
                        this.isHaveTrunBtn(false,0);
                    });
                }
            });
        }
        if(widget.historyPropertiesUpdate){
            this.forceUpdate();
        }
    }

    componentWillReceiveProps() {
    }

    dragLeftBtn(){
        let move = false;
        let _x;
        let self = this;
        let dragLocusLeft = null;
        let left = 0;

        $(".drag-locus-"+ self.props.myID + " .drag-left" ).mousedown(function(e){
            move=true;
            _x=e.pageX;
            //self.selectTrack();
            let startTime = self.props.refTrack.node.startTime;
            if(startTime !== -1){
                if(self.props.multiple > 0){
                    dragLocusLeft = startTime * 61 * self.props.multiple
                }
                else {
                    dragLocusLeft = startTime * 61 / (-self.props.multiple)
                }
            }
            else {
                dragLocusLeft = 0
            }
            left = dragLocusLeft;
            self.setState({dragLeft:dragLocusLeft});

            $(document).bind('mousemove',(function(e){
                if(move){
                    let x =  e.pageX - _x;
                    let value = left + x;
                    if(value <= 0){
                        value = 0
                    }
                    //if(self.props.refTrack.props.data[0]){
                    //    let max = self.props.refTrack.props.data[0][0] * 61 * self.props.percentage;
                    //    if(value >= max){
                    //        value = max
                    //    }
                    //}
                    self.setState({
                        isDragTrackLeft : true,
                        isDragTrackRight : false,
                        dragLeft: value
                    });
                    //console.log(left + x);
                }
            }));
            $(document).bind('mouseup',(function(){
                move=false;
                left = self.state.dragLeft;

                if(self.state.isDragTrackLeft){
                    //console.log(4);
                    let startTime;
                    if(self.props.multiple > 0){
                        startTime = self.state.dragLeft / 61 / self.props.multiple;
                    }
                    else {
                        startTime = self.state.dragLeft / 61 * (-self.props.multiple);
                    }
                    WidgetActions['updateProperties']({startTime:startTime}, false, false);
                    self.props.refTrack.props['startTime'] = startTime;
                    self.props.refTrack.node['startTime'] = startTime;
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                }
            }));
        });
    }

    dragRightBtn(){
        let move = false;
        let _x;
        let self = this;
        let dragLocusRight = null;
        let right = 0;

        $(".drag-locus-"+ self.props.myID + " .drag-right" ).mousedown(function(e){
            move=true;
            _x=e.pageX;
            let endTime = self.props.refTrack.node.endTime;
            if(endTime !== -1){
                if( self.props.multiple > 0){
                    dragLocusRight =  (self.props.totalTime - endTime) * 61 * self.props.multiple
                }
                else {
                    dragLocusRight =  (self.props.totalTime - endTime) * 61 / (-self.props.multiple)
                }
            }
            else {
                dragLocusRight = 0
            }
            right = dragLocusRight;
            //console.log(self.props.totalTime, endTime,dragLocusRight);
            self.setState({dragRight:dragLocusRight});

            $(document).bind('mousemove',(function(e){
                if(move){
                    let x =  -(e.pageX - _x);
                    let value = right + x;
                    if(value <= 0){
                        value = 0
                    }
                    //if(self.props.refTrack.props.data[0]){
                    //    let data = self.props.refTrack.props.data;
                    //    let totalTime = self.props.totalTime;
                    //    let max = (totalTime - data[data.length - 1][0]) * 61 * self.props.percentage;
                    //    if(value >= max){
                    //        value = max
                    //    }
                    //}
                    self.setState({
                        isDragTrackRight : true,
                        isDragTrackLeft : false,
                        dragRight: value
                    });
                    //console.log(right + x);
                }
            }));
            $(document).bind('mouseup',(function(){
                move=false;
                right = self.state.dragRight;

                if(self.state.isDragTrackRight){
                    //console.log(self.props.totalTime);
                    let endTime;
                    if(self.props.multiple > 0){
                        endTime = self.props.totalTime - (self.state.dragRight / 61 / self.props.multiple);
                    }
                    else {
                        endTime = self.props.totalTime - (self.state.dragRight / 61 * (-self.props.multiple));
                    }
                    //console.log(endTime);
                    self.props.refTrack.props['endTime'] = endTime;
                    self.props.refTrack.node['endTime'] = endTime;
                    WidgetActions['updateProperties']({endTime:endTime}, false, false);
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                }
            }));
        });
    }

    trackSelect(index) {
        this.onHandleClick(this.handles[index]);
    }

  	render() {
        //console.log(this.state.changeKeyValue);
        const points = this.props.points;
		const {className, prefixCls, disabled, vertical, dots, included, range, step,
			marks, max, min, tipTransitionName, tipFormatter, children} = this.props;

		const handleClassName = prefixCls + '-handle';
		const isNoTip = (step === null) || (tipFormatter === null);

        this.handles = [];

        const lowerBound = points[0] ?  points[0][0] : 0;
        const upperBound = points[points.length - 1] ? points[points.length - 1][0] : 0;
        const upperOffset = this.calcOffset(upperBound);
        const lowerOffset = this.calcOffset(lowerBound);

        for (let i = 0; i < points.length; i++) {
            let offset = this.calcOffset(points[i][0]);
            let which = this.state.changeKey;
            let isCurrentBool = false;
            if(this.props.myID === this.state.nowLayer ){
                if(this.state.changeKeyBool && isCleanKeyValue){
                    if(this.state.changeKeyValue || this.state.changeKeyValue == 0){
                        if(which === i) {
                            points[which][0] = this.state.changeKeyValue;
                            let position = points[which][0];
                            offset = this.calcOffset(position);
                            isCleanKeyValue = false;
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

            this.handles.push(<VxHandle
                className={handleClassName}
                noTip={isNoTip}
                tipTransitionName={tipTransitionName}
                tipFormatter={tipFormatter}
                vertical={vertical}
                offset={offset}
                value={points[i][0]}
                dragging={false}
                isCurrent={this.props.isCurrent && (this.state.currentHandle == i)}
                key={i}
                handleIndex={i}
                whichKey={ this.state.currentHandle }
                selectTrack={this.selectTrack}
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
        style['width'] = '100%';
        bridge.setTrackIndex(this.state.currentHandle);
        if (this.props.isCurrent){
            style['borderColor'] = '#CCC';
            bridge.showTrack(this.props.refTrack.node, this.trackSelect);
        }

        //console.log(this.props.refTrack);

        const dragLocusStyle = {};
        const dragLocusClass = 'drag-locus-layer f--h drag-locus-' + this.props.myID;
        let dragLocusLeft = null;
        let dragLocusRight = null;
        let startTime = this.props.refTrack.node.startTime;
        let endTime = this.props.refTrack.node.endTime;

        if(startTime !== -1){
            if(this.props.multiple > 0){
                dragLocusLeft = startTime * 61 * this.props.multiple
            }
            else {
                dragLocusLeft = startTime * 61 / (-this.props.multiple)
            }
        }
        else {
            dragLocusLeft = 0
        }

        if(endTime  !== -1){
            if(this.props.multiple > 0){
                dragLocusRight = (this.props.totalTime - endTime) * 61 * this.props.multiple
            }
            else {
                dragLocusRight =  (this.props.totalTime - endTime) * 61 / (-this.props.multiple)
            }
        }
        else {
            dragLocusRight = 0
        }

        let track = this.props.refTrack;
        let trackClass = track.parent.className;

        dragLocusStyle['left'] = this.state.isDragTrackLeft ? this.state.dragLeft : dragLocusLeft;
        dragLocusStyle['right'] = this.state.isDragTrackRight ? this.state.dragRight : dragLocusRight;

        if(trackClass == "image" || trackClass == "imagelist"){
            dragLocusStyle['backgroundColor'] = '#386d6a';
        }
        else if(trackClass == "text" || trackClass == "bitmaptext"){
            dragLocusStyle['backgroundColor'] = '#937c3f';
        }
        else if(trackClass == "rect" || trackClass == "ellipse" || trackClass == "path"){
            dragLocusStyle['backgroundColor'] = '#9c5454';
        }
        else if(trackClass == "button" || trackClass == "taparea"){
            dragLocusStyle['backgroundColor'] = '#405b83';
        }
        else {
            dragLocusStyle['backgroundColor'] = '#764a8f';
        }

        //console.log(track);
        //console.log(this.props.myID ,this.state.nowLayer);
		return (
			<li className={ cls({'active': this.props.isCurrent || this.props.myID === this.state.nowLayer},
                                    'timeline-row',
                                    'timeline-node',
                                    `timeline-node-${this.props.refTrack.parent.props.name}`,
                                    'f--hlc')}>
				<div className='timeline-node-meta timline-column-left f--hlc' onClick={ this.selectTrack.bind(this) }>
                    {
                        //<label className={cls('timeline-node-type', `timeline-node-type-${track.parent.className}`)} />
                    }
                    <span className={cls("timeline-node-type", this.props.pic)}/>

					<span className='timeline-node-name'>{this.props.refTrack.parent.props.name}</span>
				</div>

				<div className='timeline-node-track timline-column-right'>
                    <div className={cls("slider-right-layer",
                                        {"slider-right-hidden" : this.props.marginLeft !== 0},
                                        {"f--h" : this.props.percentage === null}) }>
                        <div style={{ width : this.props.width + 20 ,
                                        marginLeft: -(this.props.marginLeft * this.props.percentage),
                                        paddingRight: "20px",
                                        position: "relative"
                                    }}>
                            <div ref="slider" className={sliderClassName} style={style}>

                                <div className="locus-layer" onClick={ this.selectTrack.bind(this) }></div>

                                <div className={dragLocusClass} style={ dragLocusStyle }>
                                    <span className="drag-left" />
                                    <span className="flex-1"  onClick={ this.selectTrack.bind(this) } />
                                    <span className="drag-right" />
                                    <spam className={cls("mark-line",{"active": this.props.myID !== this.props.propsNowLayerId })} />
                                </div>

                                <div onTouchStart={disabled ? noop : this.onTouchStart.bind(this)}
                                     onMouseDown={disabled ? noop : this.onMouseDown.bind(this)} data-name='slider'>
                                    {this.handles}
                                </div>

                                <Track className={prefixCls + '-track'}
                                       vertical = {vertical}
                                       included={isIncluded}
                                       offset={lowerOffset}
                                       length={upperOffset - lowerOffset}/>

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

                                {
                                    //children
                                }
                            </div>

                            <div className="slider-right"
                                 style={{   minWidth : "20px" ,
                                            height: "25px",
                                            cursor: "pointer",
                                            position: "absolute",
                                            top: "0",
                                            right: "0"
                                       }}
                                 onClick={ this.selectTrack.bind(this) }></div>
                        </div>
                        <div className={cls( "slider-right flex-1",{"hidden" : this.props.percentage !== null})}
                             onClick={ this.selectTrack.bind(this) }></div>
                    </div>
				</div>
			</li>
		);
	}
}

class VxSlider extends React.Component {
	render() {
        //console.log('props: ', this.props);
		return <VxRcSlider {...this.props} ref="VxRcSlider" changSwitchState={ this.props.changSwitchState } />;
	}
}

VxSlider.defaultProps = {
	prefixCls: 'ant-slider',
	tipTransitionName: 'zoom-down'
};

export default VxSlider;
