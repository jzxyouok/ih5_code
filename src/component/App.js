import React from 'react';
import { Row, Col } from 'antd';
import $class from 'classnames';

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
import FunctionView from './FunctionView/FunctionView';
import VariableView from './VariableView/VariableView';
import EditDb from './edit-db/index'

import WidgetStore from '../stores/WidgetStore';
import ToolBoxStore from '../stores/ToolBoxStore';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stageZoom : 100,
            expandedToolbox: false,
            activeEventTreeKey: null,
            activeFunc: null,
            activeVar: null,
            editDb : false
        };
        this.stageZoomPlus = this.stageZoomPlus.bind(this);
        this.stageZoomLess = this.stageZoomLess.bind(this);
        this.stageZoomEdit = this.stageZoomEdit.bind(this);
        this.toolboxExpanded = this.toolboxExpanded.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onToolBoxStatusChange = this.onToolBoxStatusChange.bind(this);
        this.editDbShow = this.editDbShow.bind(this);
        this.editDbHide = this.editDbHide.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.unsubscribeToolbox = ToolBoxStore.listen(this.onToolBoxStatusChange);
        this.onStatusChange(WidgetStore.getStore());
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.unsubscribeToolbox();
    }

    onStatusChange(widget) {
        if(widget.selectFunction !== undefined) {
            this.setState({
                activeFunc: widget.selectFunction
            })
        } else if(widget.selectVariable !== undefined) {
            this.setState({
                activeVar: widget.selectVariable
            })
        } else if(widget.activeEventTreeKey) {
            this.setState({
                activeEventTreeKey: widget.activeEventTreeKey.key
            })
        }

    }

    onToolBoxStatusChange(toolbox) {
        if(toolbox.expanded) {
            this.setState({
                expandedToolbox: toolbox.expanded.value
            })
        }
    }

    stageZoomPlus(){
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
        if(this.state.stageZoom >20 ){
            this.setState({
                stageZoom : this.state.stageZoom - 10
            })
        }
    }

    toolboxExpanded(expanded) {
        this.setState({
            expandedToolbox : expanded
        })
    }

    editDbShow(){
        this.setState({
            editDb : true
        })
    }

    editDbHide(){
        this.setState({
            editDb : false
        })
    }

    render() {
        return (
            <div id="iH5-App">
                <DesignView stageZoom={this.state.stageZoom} />

                <NavBar />

                <ToolBox stageZoom={this.state.stageZoom}
                         stageZoomEdit={this.stageZoomEdit}
                         stageZoomPlus={this.stageZoomPlus}
                         stageZoomLess={this.stageZoomLess} />

                <PropertyView expanded={this.state.expandedToolbox}
                              isHidden={this.state.activeEventTreeKey != null
                              || this.state.activeFunc != null
                              || this.state.activeVar != null}
                              editDbShow={ this.editDbShow }  />

                <EventBox expanded={this.state.expandedToolbox}
                          isHidden={!(this.state.activeEventTreeKey != null)} />

                <FunctionView expanded={this.state.expandedToolbox}
                              isHidden={!(this.state.activeFunc != null)}/>

                <VariableView expanded={this.state.expandedToolbox}
                              isHidden={!(this.state.activeVar != null)}/>

                <ObjectView />

                <TimelineView isHidden={this.state.activeFunc != null
                              || this.state.activeVar != null}/>

                {
                    !this.state.editDb
                        ? <EditDb editDbHide={ this.editDbHide }  />
                        : null
                }

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
