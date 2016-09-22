import React,{PropTypes, Component} from 'react';

import ToolBoxButtonGroup from './ToolBoxButtonGroup';

// 工具栏按钮组别
// 如：默认工具，自定义工具etc
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
                                            expanded={this.props.expanded}
                            {...item }/>)
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