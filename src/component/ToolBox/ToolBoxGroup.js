import React,{PropTypes, Component} from 'react';

import ToolBoxButtonGroup from './ToolBoxButtonGroup';

class ToolBoxGroup extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <li className='ToolBoxGroup'>
                <center>
                {
                    this.props.data.map((item, index)=>
                        <ToolBoxButtonGroup key={index}
                            name={item.name}
                            gid={item.gid}
                            primary={item.primary}
                            secondary={item.secondary} />)
                }
                </center>
            </li>
        );
    }
}


ToolBoxGroup.propTypes = {
    name: PropTypes.string,
    data: PropTypes.array
}

module.exports = ToolBoxGroup;