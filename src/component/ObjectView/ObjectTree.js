//对象树
import React from 'react';
import $class from "classnames"

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class ObjectTree extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            nid : null,
            openData : [],
            widgetTree: null,
            selectedNode: [],
            expandedNodes: [],
            changed : null
        };
        this.chooseBtn = this.chooseBtn.bind(this);
        this.openBtn = this.openBtn.bind(this);
        this.closeBtn = this.closeBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        //initTree : 初始化对象树
        if (widget.initTree !== undefined){
            this.setState({
                widgetTree: widget.initTree[0]
            });
        }

        //redrawTree : 重新加载对象树
        else if (widget.redrawTree !== undefined){
            this.forceUpdate();
        }

        //selectWidget : 选择工具创建相应图层
        if (widget.selectWidget !== undefined) {
            let changed;
            if (widget.selectWidget) {
                let key = '' + widget.selectWidget.key;
                changed = {selectedNode: [key], expandedNodes:this.state.expandedNodes};
                let node = widget.selectWidget;
                while (node) {
                    key = '' + node.key;
                    if (changed.expandedNodes.indexOf(key) < 0)
                        changed.expandedNodes.push(key);
                    node = node.parent;
                }
            } else {
                changed = {selectedNode: []};
            }
            this.setState({
                changed : changed
            });
        }
    }

    chooseBtn(nid, data){
        //console.log(data);
        this.setState({
            nid : nid
        },()=>{
            WidgetActions['selectWidget'](data, true);
        })
    }

    openBtn(event){
        event.stopPropagation();
        let id = parseInt(event.currentTarget.getAttribute("data-nid"));
        let data = this.state.openData;
        let index = data.indexOf(id);
        if( index < 0){
            data.push(id);
            this.setState({
                openData : data
            });
        }
        console.log(data);
    }

    closeBtn(event){
        event.stopPropagation();
        let id = parseInt(event.currentTarget.getAttribute("data-nid"));
        let data = this.state.openData;
        let index = data.indexOf(id);
        if( index >= 0){
            data.splice(index, 1);
            this.setState({
                openData : data
            });
        }
        console.log(data);
    }

    render() {
        console.log(this.state.widgetTree);
        let objectData = this.state.widgetTree;
        let num = 0;

        let btn = (show)=>{
            //0图层及图层内的所有内容不可看，1可在舞台看见，-1指的是整个舞台，必是可见的
            if(show === 0 ){
                return <div className="btn f--hcc hide-btn"><span /></div>;
            }
            else if(show === -1){
                return <div className="btn f--hcc show-btn"><span /></div>;
            }
            else{
                return <div className="btn f--hcc show-btn"><span /></div>;
            }
        };

        let icon = (open, nid)=>{
            // 0是该图层下不包含任何内容，1有内容，但是内容收起来， 2有内容，且展开内容
            if(open === 0){
                return <span className="icon not-icon" />;
            }
            else if(open === 1){
                if( this.state.openData.indexOf(nid) >= 0){
                    return <span className="icon open-icon" onClick={this.closeBtn.bind(this)} data-nid={nid} />;
                }
                else {
                    return <span className="icon close-icon" onClick={this.openBtn.bind(this)} data-nid={nid} />;
                }
            }
        };

        let stageContent = (data)=>{
            num++;
            let content = data.map(fuc);
            num--;
            return content;
        };

        let fuc = (v,i)=>{
            //console.log(v);
            return  <div className="item" key={i}>
                        <div className={$class("item-title f--h f--hlc",{"active": v.key === this.state.nid})}
                             onClick={this.chooseBtn.bind(this,v.key, v)}
                             style={{ paddingLeft: num === 0 ? "28px" :num *20 + 22 +"px" }}>

                            { btn(1) }

                            {
                                v.children.length > 0
                                    ? icon( 1 , v.key)
                                    : icon( 0 , v.key)
                            }

                            {
                                <img src="/dist/img/thumbnails.png" />
                            }

                            <p>{v.className}</p>

                            {
                                Object.keys(v.events).length > 0
                                    ? <span className="event-icon" />
                                    : null
                            }
                        </div>

                        <div className={$class({"hidden": this.state.openData.indexOf(v.key) < 0 }) }>
                            {
                                v.children.length === 0
                                    ? null
                                    : stageContent(v.children)
                            }
                        </div>
                    </div>;
        };

        return (
            <div className="ObjectTree">
                {
                    !objectData
                    ? null
                    : <div className="stage">
                        <div className={$class("stage-title f--h f--hlc",{"active": objectData.tree.key === this.state.nid})}
                             onClick={this.chooseBtn.bind(this, objectData.tree.key, objectData.tree)}>
                            { btn(-1) }
                            {
                                objectData.tree.children.length > 0
                                    ? icon( 1 , objectData.tree.key)
                                    : icon( 0 , objectData.tree.key)
                            }
                            <span className="stage-icon" />
                            <p>{ objectData.name }</p>
                        </div>

                        <div className={$class("stage-content", {"hidden":  this.state.openData.indexOf(objectData.tree.key) < 0 })} >
                            {
                                objectData.tree.children.length === 0
                                    ? null
                                    : stageContent(objectData.tree.children)
                            }
                        </div>
                    </div>
                }
            </div>
        );
    }
}

module.exports = ObjectTree;