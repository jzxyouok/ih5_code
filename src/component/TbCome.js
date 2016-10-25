'use strict';
import React from 'react';


import WidgetActions from '../actions/WidgetActions';
import WidgetStore from '../stores/WidgetStore';

class  TbCome extends React.Component {
    constructor (props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {

    }

    render() {
        return (
            <div className="TbCome">
                <div className="TC-header">
                    表格数据来源
                    <span className="close-btn" />
                </div>

                <div className="TC-content">
                    <div className="title"> 选择数据库：</div>

                    <div className="dropDown-layer">
                        <div className="dropDown-title">
                            选择数据库
                        </div>
                        <div className="dropDown">
                            <ul>
                                <li>asddddd</li>
                            </ul>
                        </div>
                    </div>

                    <div className="title">数据选择：（每一列只能对应当前选中数据库字段）</div>
                    <div className="TC-db">
                        <div className="TC-db-content">
                            <div className="item">
                                <div className="item-title">第一列</div>
                                <div className="item-dropDown">
                                    <div className="iDropDown-title">
                                        选择字段
                                    </div>
                                    <div className="iDropDown">
                                        <ul>
                                            <li>asddddd</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="scroll"><span /></div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = TbCome;

