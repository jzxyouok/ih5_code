import React, {Component} from 'react';
import cls from 'classnames';
import ToolBoxGroup from './ToolBoxGroup';
import config from './DEFAUL_TOOLBOX';
import { InputNumber } from 'antd';
import ToolBoxStore from '../../stores/ToolBoxStore';
import WidgetStore from '../../stores/WidgetStore';

import DrawRect from './DrawRect';

// 左侧工具菜单
class ToolBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: config,
            expanded: false,
            zoomInputState: 0
        };
        this.focusOrBlurZoomInput = this.focusOrBlurZoomInput.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = ToolBoxStore.listen(this.onStatusChange.bind(this));
        this.unsubscribeWidget = WidgetStore.listen(this.onWidgetStatusChange.bind(this));
        window.addEventListener('click', this.onBlur);
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.unsubscribeWidget();
        window.removeEventListener('click', this.onBlur);
    }

    onStatusChange(bundle, configUpdate) {
        if(configUpdate) {
            this.setState({
                data: bundle.data
            });
        }

        if(bundle.expandedToolbox) {
            this.setState({
                expanded: bundle.expandedToolbox
            })
        }
    }

    onWidgetStatusChange(widget){
        //检查元素并更新enable字段
        if(widget.selectWidget){
            ToolBoxStore['changeToolBoxItems'](widget.selectWidget);
        }
    }

    // 点击窗口其他区域，关闭已打开的工具菜单
    onBlur() {
        //console.log('onblur');
        ToolBoxStore['openSecondary'](null, true);
    }

    toggleExpaned() {
        //清除
        new DrawRect().cleanUp();
        let newStatus = !this.state.expanded;
        this.setState({
            expanded: newStatus
        }, ()=>{
            ToolBoxStore['expandToolBox'](newStatus);
            ToolBoxStore['openSecondary'](null, true);
        });
    }

    focusOrBlurZoomInput(e) {
        let currentState = 0;
        if (e.type == 'focus') {
            currentState = 1;
        }
        this.setState({
            zoomInputState: currentState
        });
    }

    render() {
        return (
            <div id='ToolBox' onClick={ (event)=>{event.stopPropagation()} }
                className={cls({'expanded': this.state.expanded})}>
                    <div id='ToolBoxHeader'>
                        <button id='ToolBoxHeaderExpanedButton' onClick={this.toggleExpaned.bind(this)} />
                    </div>

                    <ul className='toolbox-list'>
                        {
                            (this.state === null || this.state.data === null) ? null :
                            <ToolBoxGroup expanded={this.state.expanded} {...this.state.data}/>
                        }
                    </ul>

                    <div className="stage-zoom">
                        <button className='btn-clear less-btn'  title='缩小' onClick={ this.props.stageZoomLess }>
                            <span className='heng' />
                        </button>

                        <div className={cls('size-input', {'size-input-focus': this.state.zoomInputState },
                                                             {'size-input-blur':!this.state.zoomInputState})}>

                                <InputNumber step={1}
                                             min={10}
                                             size='small'
                                             defaultValue={this.props.stageZoom + "%"}
                                             value={this.props.stageZoom  + "%"}
                                             onFocus={this.focusOrBlurZoomInput}
                                             onBlur={this.focusOrBlurZoomInput}
                                             onChange={this.props.stageZoomEdit}
                                             onKeyDown={this.props.stageZoomEdit} />
                        </div>

                        <button className='btn-clear plus-btn'  title='放大' onClick={ this.props.stageZoomPlus }>
                            <span className='heng' />
                            <span className='shu' />
                        </button>
                    </div>
            </div>);
    }
}

module.exports = ToolBox;