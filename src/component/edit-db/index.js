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
        this.saveFuc = this.saveFuc.bind(this);
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    smallBtn(){
        this.setState({
            isBig : false
        },()=>{
            this.refs.DbTable.updateNewScrollData();
        })
    }

    bigBtn(){
        this.setState({
            isBig : true
        },()=>{
            this.refs.DbTable.updateNewScrollData();
        })
    }

    saveFuc(bool,data){
        //console.log(1,data);
        this.refs.DbTable.saveBtn(bool,data);
    }

    render() {
        return (
            <div className='EditDb'>
                <div className="ED-header">数据库属性</div>

                <div className="ED-content f--h">
                    <div className={$class("ED-left",{"action": !this.state.isBig})}>
                        <Condition smallBtn={ this.smallBtn }
                                   isBig={ this.state.isBig }
                                   ref="Condition"
                                   bigBtn={ this.bigBtn }
                                   saveFuc={this.saveFuc.bind(this)} />
                    </div>

                    <div className="ED-right flex-1">
                        <DbTable isBig={ this.state.isBig } ref="DbTable" />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = EditDb;


