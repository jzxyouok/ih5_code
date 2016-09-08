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
    constructor(props) {
        super(props);
        this.state = {
            stageZoom : 100
        };
        this.stageZoomPlus = this.stageZoomPlus.bind(this);
        this.stageZoomLess = this.stageZoomLess.bind(this);
    }

    componentDidMount() {

    }


    componentWillUnmount() {

    }

    stageZoomPlus(){
        // this.setState({
        //     stageZoom : this.state.stageZoom + 10
        // });
        if(this.state.stageZoom <=190 ){
           this.setState({
               stageZoom : this.state.stageZoom + 10
           })
        }
    }

    stageZoomEdit(zoomObject){
        let setZoomState = (newZoom, object) =>{
            if (!isNaN(newZoom) && newZoom>=10 && newZoom<=200) {
                this.setState({
                    stageZoom: newZoom
                });
                if(object){
                    object.target.blur();
                }
            }
        };
        if (zoomObject.keyCode == 13 && zoomObject.type == 'keydown') {
            setZoomState(parseFloat(zoomObject.target.value), zoomObject);
        } else {
            setZoomState(zoomObject);
        }
    }

    stageZoomLess(){
        //minimum:10
        if(this.state.stageZoom >20 ){
            this.setState({
                stageZoom : this.state.stageZoom - 10
            })
        }
    }

    render() {

        return (
            <div id="iH5-App">
                <DesignView stageZoom={this.state.stageZoom}   />

                <NavBar stageZoom={this.state.stageZoom}
                        stageZoomEdit={this.stageZoomEdit.bind(this)}
                        stageZoomPlus={this.stageZoomPlus}
                        stageZoomLess={this.stageZoomLess}  />

                <ToolBox />

                <PropertyView />

                <EventBox />

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
