import React from 'react';


import { Tabs } from 'antd';

const TabPane = Tabs.TabPane;

class ParamsPanel extends React.Component{

    constructor (props) {
        super(props);
        this.newTabIndex = 0;
        const panes = [
            <TabPane tab="属性" key="1"><center>Attribute</center></TabPane>,
            <TabPane tab="扩展" key="2"><center>Extension</center></TabPane>,
            <TabPane tab="事件" key="3"><center>Event</center></TabPane>,
            <TabPane tab="动作" key="4"><center>Action</center></TabPane>
        ];
        this.state = {
            activeKey: panes[0].key,
            panes
        };
    }


    onChange(activeKey) {
        this.setState({ activeKey });
    }



    render() {
        return (
            <Tabs onChange={this.onChange.bind(this)} activeKey={this.state.activeKey}
                  type="card" >
                {this.state.panes}
            </Tabs>
        );
    }
}

module.exports = ParamsPanel;