import React, {Component} from "react";
import ToolBoxGroup from './ToolBoxGroup';
import config from './DEFAUL_TOOLBOX';
import ToolBoxStore from '../../stores/ToolBoxStore';

// 左侧工具菜单
class ToolBox extends Component {

    componentDidMount() {
        this.unsubscribe = ToolBoxStore.listen(this.onStatusChange.bind(this));
        window.addEventListener("click", this.onBlur);
    }

    componentWillUnmount() {
        this.unsubscribe();
        window.removeEventListener("click", this.onBlur);
    }

    onStatusChange(data) {
        //console.log(data);
    }

    onBlur() {
        ToolBoxStore['onOpenSecondary'](null);
    }

    render() {
        return (
            <div id="ToolBox">
                <ToolBoxGroup name={config.name} data={config.data} />
            </div>);
    }
}

module.exports = ToolBox;