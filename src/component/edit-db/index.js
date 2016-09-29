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
            isBig : true
        };
        this.smallBtn = this.smallBtn.bind(this);
        this.bigBtn = this.bigBtn.bind(this);
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    smallBtn(){
        this.setState({
            isBig : false
        })
    }

    bigBtn(){
        this.setState({
            isBig : true
        })
    }

    render() {
        return (
            <div className='EditDb f--h'>
                <div className={$class("ED-left",{"action": !this.state.isBig})}>
                    <Condition smallBtn={ this.smallBtn }
                               isBig={ this.state.isBig }
                               bigBtn={ this.bigBtn } />
                </div>

                <div className="ED-right flex-1">
                    <DbTable editDbHide={this.props.editDbHide}
                             isBig={ this.state.isBig } />
                </div>
            </div>
        );
    }
}

module.exports = EditDb;


