import React from 'react';
import DesignView from './DesignView';
import { Tabs } from 'antd';

const TabPane = Tabs.TabPane;


class WorkArea extends React.Component {

    constructor (props) {
        super(props);
        this.newTabIndex = 0;
        const panes = [
            <TabPane tab="设计视图" key="1"><DesignView /></TabPane>,
            <TabPane tab="代码视图" key="2"><center>Code View</center></TabPane>
        ];

        this.state = {
            activeKey: panes[0].key,
            panes
        };
    }

    onChange(activeKey) {
        this.setState({activeKey});
    }

    render() {
        return (
            <Tabs onChange={this.onChange.bind(this)} activeKey={this.state.activeKey} type="card" >
                {this.state.panes}
            </Tabs>
        );
    }

}


module.exports = WorkArea;