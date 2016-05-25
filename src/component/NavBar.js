import React from 'react';
import VxMenu from  './VxMenu';
import AccountArea from './AccountArea';
import { Button } from 'antd';
import { Row, Col } from 'antd';


class NavBar extends React.Component {

    render() {
        return (
            <div>
                <Row type="flex" justify="start" align="middle">
                    <Col span={3}><img src="http://www.ih5.cn/css/images/logo.png" height="50px" width="200px" /></Col>
                    <Col span={15}><VxMenu /></Col>
                    <Col span={3}><Button>预览</Button><Button>发布</Button></Col>
                    <Col span={3}><AccountArea /></Col>
                </Row>
            </div>
        );
    }
}

module.exports = NavBar;

