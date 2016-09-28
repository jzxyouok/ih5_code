//限制条件
import React from 'react';
import $class from 'classnames';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class Condition extends React.Component {
    constructor (props) {
        super(props);
        this.state = {

        };

    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div className='Condition'>
                <div className="header">限制条件</div>

                <ul>
                    <li>
                        <label>开始时间：</label>
                        <input placeholder="例如：2016/06/06 00:00:00" />
                    </li>

                    <li>
                        <label>结束时间：</label>
                        <input placeholder="例如：2016/06/06 00:00:00" />
                    </li>

                    <li>
                        <label>每人提交间隔：</label>
                        <div className="input-layer">
                            <input placeholder="无限制" />

                            <div className="btn-group">
                                <span className="btn top-btn" />
                                <span className="btn bottom-btn" />
                            </div>
                        </div>

                        <span className="unit">小时</span>
                    </li>

                    <li>
                        <label>每人提交次数：</label>
                        <div className="input-layer">
                            <input placeholder="无限制" />

                            <div className="btn-group">
                                <span className="btn top-btn" />
                                <span className="btn bottom-btn" />
                            </div>
                        </div>

                        <span className="unit">次</span>
                    </li>

                    <li>
                        <label>每人每日提交数：</label>
                        <div className="input-layer">
                            <input placeholder="无限制" />

                            <div className="btn-group">
                                <span className="btn top-btn" />
                                <span className="btn bottom-btn" />
                            </div>
                        </div>

                        <span className="unit">次</span>
                    </li>

                    <li>
                        <label>提交总人数：</label>
                        <div className="input-layer">
                            <input placeholder="无限制" />

                            <div className="btn-group">
                                <span className="btn top-btn" />
                                <span className="btn bottom-btn" />
                            </div>
                        </div>

                        <span className="unit">人</span>
                    </li>

                    <li>
                        <label>每日提交总人数：</label>
                        <div className="input-layer">
                            <input placeholder="无限制" />

                            <div className="btn-group">
                                <span className="btn top-btn" />
                                <span className="btn bottom-btn" />
                            </div>
                        </div>

                        <span className="unit">人</span>
                    </li>
                </ul>

                <div className="putAway-btn">
                    <span className="icon" />
                    收起页面
                </div>
            </div>
        );
    }
}

module.exports = Condition;



