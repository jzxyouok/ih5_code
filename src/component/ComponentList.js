import React,{PropTypes} from 'react';

import Component from './Component';

class ComponentList extends React.Component {


    constructor (props) {
        super(props);
    }

    render() {

        var items = [];
        for (var i = 0; i < this.props.content.length; i++) {
            items.push(
                <Component cid={this.props.content[i].cid} icon={this.props.content[i].icon} />
            );
        }

        return (
            <div>
                <center>
                {items}
                </center>
            </div>
        );
    }
}


ComponentList.propTypes = {
    content: PropTypes.array
}

module.exports = ComponentList;


