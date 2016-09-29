//数据库表格
import React from 'react';
import $class from 'classnames';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class DbTable extends React.Component {
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
        let width = this.props.isBig ? 769 : 928;
        return (
            <div className='DbTable'>
                <div className="DT-header f--h">
                    <p className="flex-1">列表</p>
                    <div className="btn-group">
                        <button className="btn btn-clear">导入</button>
                        <button className="btn btn-clear">导出</button>
                    </div>
                </div>

                <div className="DT-main">
                    <div className="DT-scroll">
                        <div className="DT-content" style={{ width : width }}>
                            <table>
                                <thead>
                                    <td></td>
                                    <td>用户ID</td>
                                    <td>昵称</td>
                                    <td>手机</td>
                                    <td>金额</td>
                                    <td>时间</td>
                                    <td>asdasd</td>
                                </thead>

                                <tbody>
                                    <tr>
                                        <td>1<br />0</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>

                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>

                                    <tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr><tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr><tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr><tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr><tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr><tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr><tr>
                                        <td>1</td>
                                        <td>4356757675</td>
                                        <td>复古的风格</td>
                                        <td>4356757675</td>
                                        <td>asda</td>
                                        <td>2016/06/30 12:30:23</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="add-btn f--s">
                        <button className="btn btn-clear">
                            <span className="icon" />
                            添加
                        </button>

                        <div className="flex-1"></div>
                    </div>

                    <div className="scroll-div f--h">
                        <span className="icon"/>
                        <span className="scroll flex-1 f--hlc">
                            <span />
                        </span>
                    </div>
                </div>

                <div className="DT-footer f--h">
                    <div className="left flex-1 f--hlc ">
                        <div className="account">总数： 100</div>
                        <div className="page">共 10 页</div>
                        <button className="btn btn-clear last-btn">上一页</button>
                        <div className="now-page">当前页： 1</div>
                        <button className="btn btn-clear next-bnt">下一页</button>
                    </div>

                    <div className="right f--hlc">
                        <button className="btn btn-clear cancel-btn" onClick={ this.props.editDbHide }>取消</button>
                        <button className="btn btn-clear save-btn">保存</button>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = DbTable;




