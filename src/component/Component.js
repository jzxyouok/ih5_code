import React,{PropTypes} from 'react';
import WidgetActions from '../actions/WidgetActions';

class Component extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            selected: props.selected
        };
    }

    onClick() {
        WidgetActions['addWidget'](this.props.className, this.props.param);
    }

    render() {
        return (
            <img src={this.props.icon} style={{height:'32px',width:'32px',margin:'5px'}} onClick={this.onClick.bind(this)} />
        );
    }
}

Component.propTypes = {
    cid: PropTypes.number,
    icon: PropTypes.string,
    url: PropTypes.string,
    type: PropTypes.string
};

module.exports = Component;
