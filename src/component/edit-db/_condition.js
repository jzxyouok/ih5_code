//限制条件
import React from 'react';
import $class from 'classnames';
import $ from 'jquery';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class Condition extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            node : null,
            Dbname : ""
        };
        this.inputChange = this.inputChange.bind(this);
        this.inputBlur = this.inputBlur.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
        this.onStatusChange(WidgetStore.getStore());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    inputChange(event){
        this.setState({
            Dbname : event.target.value
        })
    }

    inputBlur(){
        let name = this.state.Dbname;
        this.props.saveFuc(name);
    }

    onStatusChange(widget) {
        if(widget.selectWidget){
            if(widget.selectWidget.className == "db"){
                if(this.state.lastSelectID !== widget.selectWidget.node.dbid){
                    this.setState({
                        node : widget.selectWidget.node,
                        Dbname :  widget.selectWidget.name
                    })
                }
            }
        }
    }

    render() {
        return (
            <div className='Condition'>
                {
                    this.props.isBig
                    ? <div className={$class('Condition-layer',{"action": this.props.isBig })}>
                        <ul>
                            <li>
                                <label>ID：</label>
                                <input placeholder="" />
                            </li>

                            {
                                this.state.node
                                ? this.state.node.dbType == "shareDb"
                                    ?   <li>
                                            <label>名称：</label>
                                            <input value={ this.state.Dbname }
                                                   ref="dbname"
                                                   onBlur={ this.inputBlur.bind(this) }
                                                   onChange={ this.inputChange.bind(this) } />
                                        </li>
                                    :   null
                                : null
                            }

                            <li className="line"><span /></li>

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

                                <div className="input-content f--h">
                                    <div className="input-layer flex-1 f--h">
                                        <input placeholder="无限制" className="flex-1" />
                                        <span className="unit">小时</span>
                                    </div>

                                    <div className="btn-group">
                                        <span className="btn top-btn" />
                                        <span className="btn bottom-btn" />
                                    </div>
                                </div>
                            </li>

                            <li>
                                <label>每人提交次数：</label>

                                <div className="input-content f--h">
                                    <div className="input-layer flex-1 f--h">
                                        <input placeholder="无限制" className="flex-1" />

                                        <span className="unit">次</span>
                                    </div>

                                    <div className="btn-group">
                                        <span className="btn top-btn" />
                                        <span className="btn bottom-btn" />
                                    </div>
                                </div>
                            </li>

                            <li>
                                <label>每人每日提交数：</label>

                                <div className="input-content f--h">
                                    <div className="input-layer flex-1 f--h">
                                        <input placeholder="无限制" className="flex-1" />

                                        <span className="unit">次</span>
                                    </div>

                                    <div className="btn-group">
                                        <span className="btn top-btn" />
                                        <span className="btn bottom-btn" />
                                    </div>
                                </div>
                            </li>

                            <li>
                                <label>提交总人数：</label>

                                <div className="input-content f--h">
                                    <div className="input-layer flex-1 f--h">
                                        <input placeholder="无限制" className="flex-1" />

                                        <span className="unit">人</span>
                                    </div>

                                    <div className="btn-group">
                                        <span className="btn top-btn" />
                                        <span className="btn bottom-btn" />
                                    </div>
                                </div>
                            </li>

                            <li>
                                <label>每日提交总人数：</label>

                                <div className="input-content f--h">
                                    <div className="input-layer flex-1 f--h">
                                        <input placeholder="无限制" className="flex-1" />

                                        <span className="unit">人</span>
                                    </div>

                                    <div className="btn-group">
                                        <span className="btn top-btn" />
                                        <span className="btn bottom-btn" />
                                    </div>
                                </div>
                            </li>
                        </ul>

                        <div className="putAway-btn f--hcc" onClick={ this.props.smallBtn }>
                            <span className="icon" />
                            收起页面
                        </div>
                    </div>
                    :   <div className={$class("expand-layer",{"action": !this.props.isBig })} onClick={ this.props.bigBtn }>
                            <div className="expand-btn">
                                <span className="icon" />
                                展开
                            </div>
                        </div>
                }
            </div>
        );
    }
}

module.exports = Condition;



