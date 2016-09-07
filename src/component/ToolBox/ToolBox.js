import React, {Component} from 'react';
import cls from 'classnames';
import ToolBoxGroup from './ToolBoxGroup';
import config from './DEFAUL_TOOLBOX';
import ToolBoxStore from '../../stores/ToolBoxStore';

// 左侧工具菜单
class ToolBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: config,
            expanded: false
        };
    }

    componentDidMount() {
        this.unsubscribe = ToolBoxStore.listen(this.onStatusChange.bind(this));
        window.addEventListener('click', this.onBlur);
    }

    componentWillUnmount() {
        this.unsubscribe();
        window.removeEventListener('click', this.onBlur);
    }

    onStatusChange(bundle, configUpdate) {
        if(configUpdate) {
            this.setState({
                data: bundle.data
            });
        }
    }

    // 点击窗口其他区域，关闭已打开的工具菜单
    onBlur() {
        //console.log('onblur');
        ToolBoxStore['openSecondary'](null, true);
    }

    toggleExpaned() {
        let newStatus = !this.state.expanded;
        this.setState({
            expanded: newStatus
        });
    }

    render() {
        return (
            <div id='ToolBox' onClick={ (event)=>{event.stopPropagation()} }
                className={cls({'expanded': this.state.expanded})}>
            <div id='ToolBoxHeader'><button id='ToolBoxHeaderExpanedButton' onClick={this.toggleExpaned.bind(this)}></button></div>
            <ul className='toolbox-list'>
            {
                (this.state === null || this.state.data === null) ? null :
                <ToolBoxGroup {...this.state.data}/>
            }
            </ul>
            </div>);
    }
}

module.exports = ToolBox;