/**
 * Created by Brian on 19/10/2016.
 */
import React from 'react';
import $class from 'classnames'

import SelectTargetAction from '../../actions/SelectTargetAction';
import SelectTargetStore from '../../stores/SelectTargetStore';
import WidgetStore from '../../stores/WidgetStore'

var stId = 1;

class SelectTargetButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stId: stId++,
            activeId: null,
            isActive: false
        };
        this.classN = props.className;
        this.getResult = props.getResult;
        this.onClick = props.onClick;

        this.disabled = false;

        this.onBtnClick = this.onBtnClick.bind(this);
        this.onSelectTargetModeBlur = this.onSelectTargetModeBlur.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onWidgetStatusChange = this.onWidgetStatusChange.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = SelectTargetStore.listen(this.onStatusChange);
        this.widgetUnsubscribe = WidgetStore.listen(this.onWidgetStatusChange);
        window.addEventListener('click', this.onSelectTargetModeBlur);
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.widgetUnsubscribe();
        window.removeEventListener('click', this.onSelectTargetModeBlur);
    }

    onSelectTargetModeBlur() {
        if(this.state.isActive) {
            SelectTargetAction['selectBtnClick'](null, false);
        }
    }

    componentWillReceiveProps(nextProps) {
        this.disabled = nextProps.disabled || false;
    }

    onWidgetStatusChange(widget){
        if(widget.didSelectTarget&&widget.didSelectTarget.target&&this.state.isActive) {
            SelectTargetAction['selectBtnClick'](null, false);
            this.getResult(widget.didSelectTarget.target);
        }
    }

    onStatusChange(result) {
        if(result.stUpdate){

            let isActive = false;
            if(result.stUpdate.stId === this.state.stId && result.stUpdate.isActive) {
                isActive = true;
            }

            this.setState({
                activeId: result.stUpdate.stId,
                isActive: isActive
            })
        }
        if(result.historyPropertiesUpdate){
            this.forceUpdate();
        }
    }

    onBtnClick(e) {
        if((this.onClick!=undefined&&this.onClick()!==false) || this.onClick==undefined) {
            e.stopPropagation();
            SelectTargetAction['selectBtnClick'](this.state.stId, !this.state.isActive);
        }
    }

    render() {
        return (
            <button className={$class(this.classN, {'active':this.state.isActive})}
                    disabled={this.disabled}
                    onClick={this.onBtnClick} />
        );
    };
}

export {SelectTargetButton};