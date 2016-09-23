import React from 'react';
import cls from 'classnames';
import bridge from 'bridge';
import $ from 'jquery';

import { Slider, Row, Col, Card, Button } from 'antd';
import WidgetStore from '../../stores/WidgetStore';
import WidgetActions from '../../actions/WidgetActions';
import TimelineStores from '../../stores/Timeline';
import TimelineAction from '../../actions/TimelineAction';
import changeKeyAction from '../../actions/changeKeyAction';

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
            isChangeKey : false,
            changSwitch : false,
            overallWidth : 100 + "%",
            percentage : null,
            movableDistance : 0,
            marginLeft : 0,
            isScroll : false,
            multiple : 1,
            zoomOrLessNUm : 0,
            allWidth : null,
            dragZoomLeft : 45.5,
            startTime : 0,
            endTime : 10,
            nowLayerId : null
            //isCanAdd : true
		};

        this.flag = 0;
        this.stepX = null;
        this.stepY = null;

		this.onTimer = this.onTimer.bind(this);
        this.onPlay = this.onPlay.bind(this);
        this.onPause = this.onPause.bind(this);
        this.onPlayOrPause = this.onPlayOrPause.bind(this);
        this.formatter = this.formatter.bind(this);
        this.timeInput = this.timeInput.bind(this);
        this.timeInputSure = this.timeInputSure.bind(this);
        this.inputOnBlur = this.inputOnBlur.bind(this);
        this.changSwitchState = this.changSwitchState.bind(this);
        this.onTimerClick = this.onTimerClick.bind(this);
        this.scrollBtn = this.scrollBtn.bind(this);
        this.zoomOrLess = this.zoomOrLess.bind(this);
        this.changeAllWidth = this.changeAllWidth.bind(this);
        this.dragZoom = this.dragZoom.bind(this);
        //this.changeIsCanAdd = this.changeIsCanAdd.bind(this);
        this.dragTimeline = this.dragTimeline.bind(this);
	}

	componentDidMount() {
		this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
        TimelineStores.listen(this.ChangeKeyframe.bind(this));
        this.dragZoom();
        this.dragTimeline();
	}

	componentWillUnmount() {
		this.unsubscribe();
        //TimelineStores.removeListener(this.ChangeKeyframe.bind(this));
	}

	onStatusChange(widget) {
		//console.log('w2', widget);
		//if(widget.hasOwnProperty('hasHandle')) {
		//	this.setState({
		//		hasHandle: widget.hasHandle
		//	});
         //   console.log( widget.hasHandle);
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
                //console.log(node);
				node.children.map(item => {
					if (item.className === 'track') {
						changed.currentTrack = item;
                        //console.log(item);

                        if(item.node.startTime || item.node.endTime){
                            if(item.node.startTime){
                                this.setState({
                                    startTime : parseFloat(item.node.startTime)
                                })
                            }
                            if(item.node.endTime){
                                this.setState({
                                    endTime : parseFloat(item.node.endTime)
                                })
                            }
                        }
                        else {
                            //console.log(item);
                            this.setState({
                                startTime : 0,
                                endTime : item.timerWidget.props.totalTime ? item.timerWidget.props.totalTime : 10
                            })
                        }
					}
				});

                if(node.className === 'track'){
                    changed.currentTrack = node;

                    if(node.node.startTime || node.node.endTime){
                        if(node.node.startTime){
                            this.setState({
                                startTime : parseFloat(node.node.startTime)
                            })
                        }
                        if(node.node.endTime){
                            this.setState({
                                endTime : parseFloat(node.node.endTime)
                            })
                        }
                    }
                    else {
                        this.setState({
                            startTime : 0,
                            endTime : node.timerWidget.props.totalTime ? node.timerWidget.props.totalTime : 10
                        })
                    }
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
            this.changeAllWidth(true, changed);

            let nowID = widget.selectWidget.key;
            if(this.state.nowLayerId !== nowID){
                this.setState({
                    isChangeKey : false,
                    nowLayerId : nowID
                })
            }
		}
        if(widget.skipProperty){
            if(widget.updateProperties.totalTime){
                this.changeAllWidth(false);
            }
        }
		if (widget.updateTrack !== undefined) {
            //console.log(widget.updateTrack );
			if (widget.updateTrack !== null && widget.updateTrack.timerWidget === this.state.timerNode) {
				this.setState({currentTrack: widget.updateTrack});
			} else {
				this.setState({currentTrack: null});
			}
		}

        if(widget.updateProperties){
            if(widget.updateProperties.startTime){
                this.setState({
                    startTime : parseFloat(widget.updateProperties.startTime)
                })
            }
            if(widget.updateProperties.endTime) {
                this.setState({
                    endTime : parseFloat(widget.updateProperties.endTime)
                })
            }
        }
	}

	onTimer(p) {
		this.setState({currentTime:p});
		WidgetActions['syncTrack']();
        if(this.state.isPlaying && p === this.state.timerNode.node['totalTime'] ){
            this.onPause(true);
        }
	}

	onPlay() {
		WidgetActions['resetTrack']();
		this.state.timerNode.node['play']();
		this.setState({isPlaying:true});
	}

	onPause(bool) {
		this.state.timerNode.node['pause']();
		this.setState({
            isPlaying:false
        });
        if(bool){
            WidgetActions['resetTrack']();
            this.state.timerNode.node['seek'](0);
            WidgetActions['syncTrack']();
            this.setState({
                currentTime:0
            });
        }
	}

	onPlayOrPause() {
		this.state.isPlaying?this.onPause():this.onPlay();
	}

	onTimerChange(value) {
		WidgetActions['resetTrack']();
		this.state.timerNode.node['seek'](value);
		WidgetActions['syncTrack']();
		this.setState({
            currentTime:value
        },()=>{
            //this.changeIsCanAdd();
        });
        TimelineAction['ChangeKeyframe'](false,value);
	}

    onTimerClick(){
        changeKeyAction['ChangeKey'](false);
        this.changSwitchState(0);
    }

    ChangeKeyframe(data){
        //console.log(data);
       this.setState({
           isChangeKey : data
       })
    }

	// 添加时间断点
	onAdd() {
        //console.log(this.state.currentTime,this.state.startTime,this.state.endTime)
        if(this.state.currentTime < this.state.startTime
            || this.state.currentTime> this.state.endTime){
            return;
        }

		if (this.state.currentTrack) {
            //console.log(this.state.currentTrack);
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
            TimelineAction['ChangeKeyframe'](false);
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

        this.changSwitchState(0);
		// 如果有活动的时间断点
		if(this.state.isChangeKey) {
			this.onDelete();
		} else {
			this.onAdd();
		}
	}

    formatter(value){
        let data = value;
        return data.toFixed(2);
    }

    timeInput(){
        let data = this.refs.TimeInput.value;
        //console.log(data);
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
            if(data < 0){
                data = 0
            }
            this.setState({
                inputState : false,
                currentTime : parseFloat(data)
            },()=>{
                //this.changeIsCanAdd();
            });
            //console.log(5446,this.state.isChangeKey);
            if(this.state.isChangeKey){
                //console.log(this.state.startTime,this.state.endTime);
                //if(data < this.state.startTime){
                //    WidgetActions['updateProperties']({startTime:data}, false, false);
                //    this.state.currentTrack.props['startTime'] = data;
                //    this.state.currentTrack.node['startTime'] = data;
                //
                //}
                //else if(data > this.state.endTime){
                //    WidgetActions['updateProperties']({endTime:data}, false, false);
                //    this.state.currentTrack.props['endTime'] = data;
                //    this.state.currentTrack.node['endTime'] = data;
                //}
                TimelineAction['ChangeKeyframe'](true,parseFloat(data));
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

    inputOnBlur(event){
        let data = this.refs.TimeInput.value;
        let max = parseInt(event.currentTarget.getAttribute("data-max"));
        if(data > max){
            data = max;
        }
        if(data < 0){
            data = 0
        }
        this.setState({
            inputState : false,
            currentTime : parseFloat(data)
        },()=>{
            //this.changeIsCanAdd();
        });
        if(this.state.isChangeKey){
            //console.log(this.state.startTime,this.state.endTime);
            //if(data < this.state.startTime){
            //    WidgetActions['updateProperties']({startTime:data}, false, false);
            //    this.state.currentTrack.props['startTime'] = data;
            //    this.state.currentTrack.node['startTime'] = data;
            //}
            //else if(data > this.state.endTime){
            //    WidgetActions['updateProperties']({endTime:data}, false, false);
            //    this.state.currentTrack.props['endTime'] = data;
            //    this.state.currentTrack.node['endTime'] = data;
            //}
            TimelineAction['ChangeKeyframe'](true,parseFloat(data));
        }
    }

	selectNextBreakpoint() {
        if(this.state.changSwitch === -1 || this.state.changSwitch === 2){
            //console.log("next");
            changeKeyAction['ChangeKey'](true,1);
        }
	}

	selectPrevBreakpoint() {
        if(this.state.changSwitch === 1 || this.state.changSwitch === 2){
            //console.log("last");
            changeKeyAction['ChangeKey'](true,-1);
        }
	}

    changSwitchState(state){
        //console.log(state);
        this.setState({
            changSwitch: state
        })
    }

    scrollBtn(){
        if(this.state.percentage !== null){
            let move = false;
            let _x;
            let self = this;
            let initialmarginLeft = 0;
            let movableDistance = self.state.movableDistance;
            $(".overall-zoom .overall span").mousedown(function(e){
                move=true;
                _x=e.pageX;
            });
            $(document).mousemove(function(e){
                if(move && self.state.percentage !== null){
                    let x =  e.pageX - _x;
                    let value = initialmarginLeft + x;
                    let result;
                    if(value<0){
                        result = 0;
                    }
                    else {
                        result = value >= movableDistance ? movableDistance : value;
                        //console.log(result,movableDistance);
                    }
                    self.setState({
                        marginLeft : result
                        , isScroll : true
                    });
                }
            }).mouseup(function(){
                move=false;
                initialmarginLeft = self.state.marginLeft >= movableDistance
                                     ? movableDistance : self.state.marginLeft;
                self.setState({
                    isScroll : false
                })
            });
        }
    }

    zoomOrLess(num){
        let index = this.state.zoomOrLessNUm;
        if(num == -1 && index !== -1){
            let multiple;
            if(index - 1 == 0){
                multiple = 1;
            }
            else {
                multiple = -10;
            }
            this.setState({
                zoomOrLessNUm : index-1,
                multiple : multiple,
                marginLeft : 0
            },()=>{
                //console.log('xxx',this.state.zoomOrLessNUm,this.state.multiple);
                this.changeAllWidth(false);
            })
        }
        else if(num == 1 && index !== 1){
            let multiple;
            if(index + 1 == 1){
                multiple = 10;
            }
            else {
                multiple = 1;
            }
            this.setState({
                zoomOrLessNUm : index + 1,
                multiple : multiple,
                marginLeft : 0
            },()=>{
                this.changeAllWidth(false);
                //console.log('+++',this.state.zoomOrLessNUm,this.state.multiple);
            })
        }
    }

    changeAllWidth(bool,changed){
        let totalTime = 10;
        let data;
        if(bool){
            data = changed.timerNode ? changed.timerNode : this.state.timerNode;
        }
        else {
            data = this.state.timerNode;
        }

        if(data){
            if(data.timerWidget){
                totalTime = data.timerWidget.props.totalTime ? data.timerWidget.props.totalTime : 10;
                let maxWidth  =  window.innerWidth-318-170;
                let multiple = this.state.multiple;
                let allWidth;
                if(multiple == -10){
                    allWidth = 61 * totalTime / (- this.state.multiple)
                }
                else {
                    allWidth = 61 * totalTime * this.state.multiple
                }
                //console.log('ooo',allWidth,this.state.multiple, maxWidth);
                if( allWidth > maxWidth ){
                    let percentage = (allWidth + 20) / maxWidth;
                    percentage.toFixed(3);
                    //console.log(percentage);
                    if(percentage <=0){
                        this.setState({
                            percentage : null,
                            movableDistance : 0,
                            overallWidth : 100 + "%",
                            allWidth : allWidth
                        });
                    }
                    else {
                        let width =  maxWidth / percentage;
                        width.toFixed(3);
                        this.setState({
                            percentage : percentage,
                            overallWidth : width + "px",
                            movableDistance : maxWidth - width,
                            allWidth : allWidth
                        },()=>{
                            //console.log(width,this.state.movableDistance);
                            this.scrollBtn();
                        });
                    }
                }
                else {
                    this.setState({
                        percentage : null,
                        movableDistance : 0,
                        overallWidth : 100 + "%",
                        allWidth : allWidth
                    });
                }
            }
        }
    }

    dragZoom(){
        let move = false;
        let _x;
        let self = this;
        let left = 45.5;
        let p = 0;
        $(".overall-zoom .zoom-slider .btn").mousedown(function(e){
            move=true;
            _x=e.pageX;
        });
        $(document).mousemove(function(e){
            if(move){
                let x =  e.pageX - _x;
                //let multiple;
                p = left + x;
                //let a = p /10;
                //a.toFixed(2);
                //console.log(left,  x , p);
                if(p>=91){
                    p = 91;
                    //multiple = 10;
                }
                else if( p <= 0){
                    p = 0;
                    //multiple = -10;
                }
                //else if( p == 45.5){
                //    multiple = 1;
                //}
                //else if(p>0 && p<45.5){
                //    multiple = -a;
                //}
                //else{
                //    multiple = a;
                //}
                //console.log(multiple,p);
                self.setState({
                    dragZoomLeft : p
                    //multiple : multiple
                },()=>{
                    //self.changeAllWidth(false);
                })
            }
        }).mouseup(function(){
            move=false;
            left = self.state.dragZoomLeft;
        });
    }

    dragTimeline(){
        let move = false;
        let _x;
        let _y;
        let self = this;

        let left = 37;
        let right = 281;
        let bottom = 0;

        //$("").mousedown(function(e){
        //    move=true;
        //    _x= e.pageX;
        //    _y= e.pageY;
        //});
        //$(document).mousemove(function(e){
        //    if(move){
        //        let x = e.pageX - _x;
        //        let y = e.pageY - _y;
        //    }
        //}).mouseup(function(){
        //    move=false;
        //});
    }

	render() {
        let tracks = [];
        let index = 0;
        let totalTime = 10;
        //console.log('timerNode', this.state.timerNode);
        //console.log(this.state.currentTrack)

        const getTracks = (node) => {
            if (node.className === 'track') {
                let pic = null;
                this.refs.ComponentPanel.panels[0].cplist.map((v1,i2)=>{
                    if (v1.className === node.parent.className){
                        pic = v1.icon;
                    }
                });
                //console.log(node);
                //console.log(this.state.currentTrack);
                tracks.push(
                    <VxSlider
                        key={index++}
                        max={totalTime}
                        step={0.01}
                        refTrack={node}
                        pic={pic}
                        width={this.state.allWidth}
                        refTimer={this.state.timerNode}
                        points={node.props.data}
                        myID = { node.parent.key }
                        ref="VxSlider"
                        totalTime = { totalTime }
                        marginLeft = { this.state.marginLeft }
                        percentage = { this.state.percentage}
                        multiple = { this.state.multiple}
                        changSwitchState={ this.changSwitchState }
                        isCurrent={node === this.state.currentTrack} />);
            }
            node.children.map(item => getTracks(item));
        };

        if (this.state.timerNode && this.refs.ComponentPanel) {
            if(this.state.timerNode.props.totalTime){
                totalTime = this.state.timerNode.props.totalTime;
                getTracks(this.state.timerNode);
            }
            else {
                getTracks(this.state.timerNode);
            }
        }

        let unit = (data)=>{
            let arry = [];
            let multiple = this.state.multiple;
            let totalTime;
            if(multiple == -10){
                totalTime = data / (- this.state.multiple)
            }
            else {
                totalTime = data * this.state.multiple
            }
            for(let i=1; i<=totalTime; i++){
                arry.push(i);
            }
            return arry.map((v,i)=>{
                return <li key={i}>
                            <span>
                                {
                                    multiple == 10
                                        ? v/10 + 's'
                                        : multiple == -10
                                            ? v*10 + 's'
                                            : v >= 10 || v == 0 ? v + 's' : '0'+ v + 's'
                                }
                            </span>
                        </li>;
            });
        };

        let scrollwidth = window.innerWidth-318 + "px";

        return (
            <div id='TimelineView' className={ cls({"hidden":!this.state.timerNode })}>
                <div className="hidden">
                    <ComponentPanel ref="ComponentPanel" />
                </div>

                <div id='TimelineHeader' className='timeline-row f--h'>
                    <div className='timline-column-left f--hlc'>
                        <div id='TimelineTitle'>时间轴</div>
                        <div id='TimelineNodeDuration'
                             className={ cls('f--hlc flex-1',{'active': this.state.currentTrack!=null})}>

                            <span id='TimelineIndicator'
                                  className={cls({'active': this.state.isChangeKey})} />

                            <input type='text'
                                   value={ this.state.inputState ?  this.state.inputTime :this.state.currentTime.toFixed(2) }
                                   onChange={ this.timeInput.bind(this) }
                                   onKeyDown = { this.timeInputSure.bind(this)}
                                   onBlur={ this.inputOnBlur.bind(this) }
                                   data-max = {totalTime}
                                   ref="TimeInput"/>
                            <span>s</span>
                        </div>
                    </div>

                    <div className='timline-column-right flex-1 f--h' id='TimelineNodeAction'>
                        <div>
                            <button id='TimelineNodeActionPrev'
                                    className={ cls({"active": this.state.changSwitch !== 1 && this.state.changSwitch !== 2}) }
                                    onClick={this.selectPrevBreakpoint.bind(this)} />
                            <button id='TimelineNodeActionModify'
                                    className={cls(
                                        {'active': this.state.currentTrack!=null},
                                        {'delete': this.state.isChangeKey}
                                        //{'none': !this.state.isCanAdd }
                                    )}
                                    onClick={this.onAddOrDelete.bind(this)} />
                            <button id='TimelineNodeActionNext'
                                    className={ cls({"active": this.state.changSwitch !== -1 && this.state.changSwitch !== 2}) }
                                    onClick={this.selectNextBreakpoint.bind(this)} />
                        </div>

                        <div className="flex-1 dragTimeline" onClick={ this.dragTimeline} style={{cursor:"crosshair"}}></div>
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

                    <div id='TimelineRuler' className='timline-column-right' style={{ width : scrollwidth }}>
                        {
                            // <div id="TimelineRulerNumbers">
                            // </div>
                            // <div id="TimelineRulerMap"></div>
                            // <div id='TimelineRulerSlide' style={{
                            // 	left: `${this.state.currentTime * 100 - 13}px`
                            // }}></div>
                        }
                        <span className={ cls("unit-0",{ "hidden" : this.state.marginLeft !==0 })}>0s</span>
                        <span className={ cls("icon",{ "hidden" : this.state.percentage !== null })} />

                        <div className="unit">
                            <ul className="f--h"
                                style={{ width : this.state.allWidth + 20 +"px",
                                            left : - (this.state.marginLeft * this.state.percentage) }}>
                                { unit(totalTime) }
                            </ul>
                        </div>

                        <div className={ cls("time-ruler-layer",{ "time-ruler-hidden" : this.state.marginLeft !==0 && this.state.isScroll})}>
                            <div style={{ width : this.state.allWidth + 20 +"px",
                                            marginLeft : - (this.state.marginLeft * this.state.percentage) ,
                                            paddingRight : 20 + "px"
                                        }}
                                 className="time-ruler-div"
                                 onClick={this.onTimerClick.bind(this)}>

                                <Slider max={totalTime}
                                        step={0.01}
                                        value={this.state.currentTime}
                                        tipFormatter={  this.formatter  }
                                        onChange={this.onTimerChange.bind(this)} />
                            </div>
                        </div>
                    </div>
                </div>
                <div id='TimlineNodeContent'>
                    <div id="TimlineNodeList">
                        <ul style={{ width : scrollwidth }} >
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

                <div className="overall-zoom f--h">
                    <div className="zoom f--h">
                        <span className={ cls("left-btn",{ "active": this.state.multiple == -10  })}
                              onClick={ this.zoomOrLess.bind(this, -1) } />

                        <div className="zoom-slider f--hlc">
                            <span className="line" />
                            <span className="btn" style={{ left : this.state.dragZoomLeft + 'px' }} />
                        </div>

                        <span className={ cls("right-btn" ,{ "active": this.state.multiple ===10  })}
                              onClick={ this.zoomOrLess.bind(this, 1) } />
                    </div>

                    <div className="overall flex-1 f--hlc">
                        <span style={{ width : this.state.overallWidth, marginLeft : this.state.marginLeft }} />
                    </div>
                </div>
            </div>
		);
	}

}


module.exports = TimelineView;
