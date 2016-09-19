'use strict';

import React from 'react';

import WidgetActions from '../actions/WidgetActions';
import WidgetStore from '../stores/WidgetStore';
import InputText from './InputText';
//import DbDialog from './DbDialog';
import JSZip from 'jszip';

import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class  VxMenu extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            current: 'mail',
            classList: [],
            addClassVisible: false,
            editDbVisible: false
        };
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if (widget.classList !== undefined) {
            this.setState({classList: widget.classList});
        }
    }

    handleClick(e) {
        let key = e.key;

        if (key.substr(0, 5) === 'open_') {
            this.setState({current: key});
            this.props.onOpen(key.substr(5));
        } else if (key === 'delete') {
            WidgetActions['removeWidget']();
        } else if (key === 'copy') {
            WidgetActions['copyWidget']();
        } else if (key === 'paste') {
            WidgetActions['pasteWidget']();
        } else if (key === 'moveUp') {
            WidgetActions['reorderWidget'](1);
        } else if (key === 'moveDown') {
            WidgetActions['reorderWidget'](-1);
        } else if (key === 'addClass') {
            this.setState({addClassVisible: true});
        } else if (key.substr(0, 6) === 'class_') {
            WidgetActions['addWidget'](key.substr(5));
        } else if (key === 'uploadFont') {
            WidgetActions['chooseFile']('font', true, (w, text) => {
                this.props.onUploadFont(text);
            });
        } else if (key.substr(0, 5) === 'font_') {
            WidgetActions['setFont'](key.substr(5));
        } else if (key === 'editDb') {
            this.setState({editDbVisible: true});
        }
        /*
         this.setState({
         current: e.key
         });
         PixelActions['createScene']();*/
    }

    onAddClassDone(s) {
        if (s)
            WidgetActions['addClass'](s);
        this.setState({addClassVisible: false});
    }

    render() {
        /*
         return (
         <Menu onClick={this.handleClick.bind(this)}
         selectedKeys={[this.state.current]}
         mode="horizontal">

         <SubMenu title={<span><Icon type="desktop" />操作</span>}>
         <MenuItemGroup>
         <Menu.Item key="NewScene">新建场景</Menu.Item>
         <Menu.Item key="NewComp">新建组件</Menu.Item>
         <Menu.Item key="AutoSave">自动保存</Menu.Item>
         <Menu.Item key="Save">保存</Menu.Item>
         <Menu.Item key="SaveAs">另存为...</Menu.Item>
         </MenuItemGroup>
         <MenuItemGroup title="——————">
         <Menu.Item key="ImportPSD">导入PSD</Menu.Item>
         <Menu.Item key="ImportPPT">导入PPT</Menu.Item>
         </MenuItemGroup>
         <MenuItemGroup title="——————">
         <Menu.Item key="Setting">设置</Menu.Item>
         <Menu.Item key="Close">关闭</Menu.Item>
         </MenuItemGroup>
         </SubMenu>
         <SubMenu title={<span><Icon type="edit" />编辑</span>}>
         <MenuItemGroup>
         <Menu.Item key="Undo">撤销</Menu.Item>
         <Menu.Item key="Redo">重做</Menu.Item>
         </MenuItemGroup>
         <MenuItemGroup  title="——————">
         <Menu.Item key="Cut">剪切</Menu.Item>
         <Menu.Item key="Paste">粘贴</Menu.Item>
         <Menu.Item key="Copy">复制</Menu.Item>
         </MenuItemGroup>
         <MenuItemGroup  title="——————">
         <Menu.Item key="Replace">查找/替换</Menu.Item>
         </MenuItemGroup>
         </SubMenu>
         <SubMenu title={<span><Icon type="ellipsis" />视图</span>}>
         <MenuItemGroup>
         <Menu.Item key="History">操作历史</Menu.Item>
         <Menu.Item key="Debug">调试窗口</Menu.Item>
         <Menu.Item key="CodeView">代码视图</Menu.Item>
         <Menu.Item key="DesignView">设计视图</Menu.Item>
         </MenuItemGroup>
         <MenuItemGroup  title="——————">
         <Menu.Item key="ZoomIn">放大</Menu.Item>
         <Menu.Item key="ZoomOut">缩小</Menu.Item>
         <Menu.Item key="Zoom100">100%</Menu.Item>
         </MenuItemGroup>
         <MenuItemGroup  title="——————">
         <Menu.Item key="AddRefLine">新建参考线</Menu.Item>
         <Menu.Item key="ClearRefLine">清除参考线</Menu.Item>
         <Menu.Item key="LockRefLine">锁定参考线</Menu.Item>
         </MenuItemGroup>
         </SubMenu>
         <SubMenu title={<span><Icon type="phone" />帮助</span>}>
         <MenuItemGroup>
         <Menu.Item key="Template">选择模板</Menu.Item>
         <Menu.Item key="Tutorial">设计教程</Menu.Item>
         <Menu.Item key="ContactUS">联系我们</Menu.Item>
         </MenuItemGroup>
         </SubMenu>
         </Menu>
         );*/

        return (
            <div>
                <Menu onClick={this.handleClick.bind(this)}
                      selectedKeys={[this.state.current]}
                      mode="horizontal">

                    <SubMenu title={<span><Icon type="desktop" />作品</span>}>
                        { this.props.works.map(item => <Menu.Item key={'open_' + item['id']}>{item['name']}</Menu.Item>) }
                    </SubMenu>

                    <SubMenu title={<span><Icon type="edit" />类</span>}>
                        <Menu.Item key="addClass">添加</Menu.Item>
                        { this.state.classList.map(item => <Menu.Item key={'class_' + item}>Add {item}</Menu.Item>) }
                    </SubMenu>

                    <SubMenu title={<span><Icon type="edit" />字体</span>}>
                        <Menu.Item key="uploadFont">上传字体</Menu.Item>
                        { this.props.fontList.map(item => <Menu.Item key={'font_' + item['file']}>{item['name']}</Menu.Item>) }
                    </SubMenu>

                    <SubMenu title={<span><Icon type="edit" />数据库</span>}>
                        <Menu.Item key="editDb">编辑数据库</Menu.Item>
                    </SubMenu>

                    <SubMenu title={<span><Icon type="edit" />编辑</span>}>
                        <MenuItemGroup>
                            <Menu.Item key="delete">删除</Menu.Item>
                            <Menu.Item key="copy">复制</Menu.Item>
                            <Menu.Item key="paste">粘贴</Menu.Item>
                            <Menu.Item key="moveUp">向上移动</Menu.Item>
                            <Menu.Item key="moveDown">向下移动</Menu.Item>
                        </MenuItemGroup>
                    </SubMenu>
                </Menu>
                <InputText title="类名字" visible={this.state.addClassVisible} editText={null} onEditDone={this.onAddClassDone.bind(this)} />
                {
                    //<DbDialog visible={this.state.editDbVisible} />
                }
            </div>
        );
    }
}

module.exports = VxMenu;
