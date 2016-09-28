//编辑数据库
import React from 'react';
import $class from 'classnames';

import Condition from './_condition'
import DbTable from './_dbTable'

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class EditDb extends React.Component {
    constructor (props) {
        super(props);
        this.state = {

        };

    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div className='EditDb f--h'>
                <div className="ED-left">
                    <Condition />
                </div>

                <div className="ED-right flex-1">
                    <DbTable />
                </div>
            </div>
        );
    }
}

module.exports = EditDb;


