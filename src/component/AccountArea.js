import React from 'react';

import { Row, Col } from 'antd';

class AccountArea extends React.Component {
    render() {
        return (
            <div>
                <Row>
                    <Col span={12}>{this.props.username}</Col>
                    <Col span={12}><img src="http://img.zcool.cn/community/014abe557e8ed50000002d5c19e576.jpg" height="32px" width="32px"/></Col>
                </Row>
            </div>
        );
    }
}

module.exports = AccountArea;

