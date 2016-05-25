import React,{PropTypes} from 'react';


class Component extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            selected: props.selected
        };
    }

    render() {
        return (
            <img src={this.props.icon} style={{height:'32px',width:'32px',margin:'5px'}} />
        );
    }


}

Component.propTypes = {
    cid: PropTypes.number,
    icon: PropTypes.string,
    url: PropTypes.string,
    type: PropTypes.string,
    selected: PropTypes.boolean
};

module.exports = Component;
