//添加／编辑小模块
import React from 'react';
import $class from 'classnames';

import {Form, Input, InputNumber} from 'antd';
import WidgetActions from '../../actions/WidgetActions';
import WidgetStore, {nodeType, varType} from '../../stores/WidgetStore';

class EditBlock extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            minSize: false,
            blockId: null,
            name: '',
            props: [],
            eventTree: [],
        };

        this.toggle = this.toggle.bind(this);
        this.saveBlock = this.saveBlock.bind(this);
        this.saveAsNewBlock = this.saveAsNewBlock.bind(this);
    }

    toggle(){
        this.setState({
            minSize: !this.state.minSize
        })
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {

    }

    saveBlock() {

    }

    saveAsNewBlock() {

    }

    cancel() {
        WidgetActions['activeBlockMode'](false);
    }

    render() {
        return <div id="EditBlockView"
                    className={$class('propertyView', {'keep':this.state.minSize}, {'hidden':this.props.isHidden})}
                    style={{ left : this.props.expanded? '64px':'37px'}}>
            <div id='EditBlockViewHeader' className="f--hlc">
                <span className="flex-1">自定义小模块</span>
                <button className='btn btn-clear' title='收起' onClick={this.toggle}/>
            </div>
            <div id='EditBlockViewBody'>
                <div onClick={this.saveBlock}>try save</div>
                <div onClick={this.saveAsNewBlock}>try save new</div>
                <div onClick={this.cancel}>cancel</div>
            </div>
        </div>
    }
}

module.exports = EditBlock;