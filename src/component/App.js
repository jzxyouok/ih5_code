import React from 'react';
import { Row, Col } from 'antd';

import NavBar from  './NavBar';
import ComponentPanel from './ComponentPanel';
import DesignView from './DesignView';
import ObjectView from './ObjectView/_index';
import PropertyView from './PropertyView';
import TimelineView from './TimelineView';
import ToolBox from './ToolBox/ToolBox';
import EventBox from './EventBox/_index'

class App extends React.Component {
    render() {
        return (
            <div>
                <NavBar />

                <ToolBox />

                <PropertyView />

                <EventBox />

                <div className="f--hcc">
                    <DesignView />
                </div>

                <ObjectView />

                {
                    //<Row gutter={5}>
                    //    <Col span={3}><ComponentPanel /></Col>
                    //    <Col span={4}><PropertyView /></Col>
                    //    <Col span={12}><DesignView /><TimelineView /></Col>
                    //    <Col span={5}><ObjectView /></Col>
                    //</Row>
                }
            </div>
        );
    }
}

module.exports = App;
