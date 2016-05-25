import React from 'react';
import { Row, Col } from 'antd';

import NavBar from  './NavBar';
import WorkArea from './WorkArea';
import ComponentPanel from './ComponentPanel';
import ObjectView from './ObjectView';

class App extends React.Component {
    render() {
        return (
            <div>
                <NavBar />
                <Row gutter="5">
                    <Col span={2}><ComponentPanel /></Col>
                    <Col span={17}><WorkArea /></Col>
                    <Col span={5}><ObjectView /></Col>
                </Row>
            </div>
        );
    }
}

module.exports = App;