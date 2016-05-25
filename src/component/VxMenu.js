'use strict';

import React from 'react';
import PixelActions from '../actions/PixelActions'

import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;


class  VxMenu extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            current: 'mail'
        };
    }

    handleClick(e) {
        this.setState({
            current: e.key
        });
        PixelActions.createScene();
    }

    render() {
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
        );
    }
}

module.exports = VxMenu;