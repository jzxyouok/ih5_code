import React from 'react';
import { Row, Col } from 'antd';

import NavBar from  './NavBar';
import ComponentPanel from './ComponentPanel';
import DesignView from './DesignView';
import ObjectView from './ObjectView';
import PropertyView from './PropertyView';
import TimelineView from './TimelineView';

class App extends React.Component {
    render() {
        return (
            <div>
                <NavBar />
                <Row gutter={5}>
                    <Col span={2}><ComponentPanel /></Col>
                    <Col span={4}><PropertyView /></Col>
                    <Col span={13}><DesignView /><TimelineView /></Col>
                    <Col span={5}><ObjectView /></Col>
                </Row>
            </div>
        );
    }
}

module.exports = App;
