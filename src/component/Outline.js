import React from 'react';


import { Tree } from 'antd';
import { Card } from 'antd';
const TreeNode = Tree.TreeNode;

import WidgetActions from '../actions/WidgetActions';
import WidgetStore from '../stores/WidgetStore';

class Outline extends React.Component{
    constructor (props) {
        super(props);
        this.state = {
            widgetTree: null,
            selectedNode: [],
            expandedNodes: []
        };
    }

    onDragEnter() {
        //console.log(info);
        // expandedKeys 需要受控时设置
        // this.setState({
        //   expandedKeys: info.expandedKeys,
        // });
    }

    onDrop() {
        //console.log(info);
        /*
        const dropKey = info.node.props.eventKey;
        const dragKey = info.dragNode.props.eventKey;
        // const dragNodesKeys = info.dragNodesKeys;
        const loop = (data, key, callback) => {
            data.forEach((item, index, arr) => {
                if (item.key === key) {
                    return callback(item, index, arr);
                }
                if (item.children) {
                    return loop(item.children, key, callback);
                }
            });
        };
        const data = [...this.state.gData];
        let dragObj;
        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });
        if (info.dropToGap) {
            let ar;
            let i;
            loop(data, dropKey, (item, index, arr) => {
                ar = arr;
                i = index;
            });
            ar.splice(i, 0, dragObj);
        } else {
            loop(data, dropKey, (item) => {
                item.children = item.children || [];
                // where to insert 示例添加到尾部，可以是随意位置
                item.children.push(dragObj);
            });
        }
        this.setState({
            gData: data
        });
        {(this.state.widgetTree) ? loop(this.state.widgetTree) : ''}
        */
    }

    onStatusChange(widget) {
        if (widget.initTree !== undefined)
            this.setState({widgetTree: widget.initTree});
        else if (widget.redrawTree !== undefined)
            this.forceUpdate();

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
            this.setState(changed);

        }
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onSelect(selectedKeys, e) {
        if (e.selectedNodes.length > 0) {
            WidgetActions['selectWidget'](e.selectedNodes[0].props.node, true);
        } else {
            WidgetActions['selectWidget'](null);
        }
    }

    onExpand(expandedKeys, e) {
        if (!e.expanded) {
            expandedKeys.splice(expandedKeys.indexOf('' + e.node.props.node.key), 1);
        }
        this.setState({expandedNodes: expandedKeys});
    }

    render() {
        const loop = (data,rootName) => data.map(item => {
            return <TreeNode key={item.key} title={(rootName) ? rootName : item.className} node={item}>{(item.children) ? loop(item.children) : ''}</TreeNode>;
        });
        let child = [];
        if (this.state.widgetTree) {
            this.state.widgetTree.forEach(item => {
                child.push(loop([item.tree], item.name));
            });
        }
        return (
                <Card title="对象树" >
                    <Tree autoExpandParent={false} selectedKeys={this.state.selectedNode} expandedKeys={this.state.expandedNodes} onSelect={this.onSelect.bind(this)} onExpand={this.onExpand.bind(this)}>{child}</Tree>
                </Card>
        );
    }
}

module.exports = Outline;
