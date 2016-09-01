import React from 'react';
import { Row, Col } from 'antd';

import NavBar from  './NavBar';
import ComponentPanel from './ComponentPanel';
import DesignView from './DesignView';
import ObjectView from './ObjectView/_index';
import PropertyView from './PropertyView';
//import TimelineView from './TimelineView';
import ToolBox from './ToolBox/ToolBox';
import EventBox from './EventBox/_index';
import ParamsPanel from './ParamsPanel';
import TimelineView from './Timeline/TimelineView';

class App extends React.Component {
    render() {
        return (
            <div id="iH5-App">
                <DesignView />

                <NavBar />

                <ToolBox />

                <PropertyView />

                {
                    //<EventBox />
                }
                
                <div style={{position: "absolute",left: "300px",top: "37px",background: "#fff",width: "312px"}}>
                    <ParamsPanel />
                </div>

                <ObjectView />

                <TimelineView />

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
