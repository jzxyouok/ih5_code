/**
 * Created by Brian on 31/10/2016.
 */
import React from 'react';
import $class from 'classnames';
import WidgetActions from '../../actions/WidgetActions';

let tableType = {
    db: 1,
    list: 2,
};

class ArrTableDropDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dropDownShow: false,
            dbHeader: [],
            isLoading: false,
        };
        this.onClickArrTableData = this.onClickArrTableData.bind(this);
        this.onToggleDropDown = this.onToggleDropDown.bind(this);
        this.onTableBlur = this.onTableBlur.bind(this);
    }

    onClickArrTableData(row, column, type, e) {
        e.stopPropagation();
        this.setState({
            dropDownShow: false
        }, ()=>{
            this.props.onChange(row, column, type);
        })
    }

    onToggleDropDown(e) {
        e.stopPropagation();
        if(this.props.onClick) {
            this.props.onClick();
        }

        if(this.props.dbSource&&!this.state.dropDownShow) {
            //获取db数据，获取头
            this.setState({
               isLoading: true
            });
            WidgetActions['ajaxSend'](null, 'POST', 'app/dbGetParm/' + this.props.dbSource, null, null, function(text) {
                var result = JSON.parse(text);
                if (result['header']) {
                    let headerData = result['header'].split(",");
                    let index = headerData.indexOf("null");
                    if(!(headerData.length !== 0 && index < 0)){
                        headerData = [];
                    }
                    this.setState({
                        isLoading: false,
                        dbHeader : headerData
                    })
                }
            }.bind(this));
        }

        this.setState({
            dropDownShow: !this.state.dropDownShow
        }, ()=>{
            if(this.state.dropDownShow) {
                this.refs['arrTable'].focus();
            }
        })
    }

    onTableBlur() {
        this.setState({
            dropDownShow: false
        })
    }

    render() {
        let drawRow = (row, column, type)=> {
            let data = [];
            let length = 0;
            switch (type){
                case tableType.db:
                    length = column.length;
                    break;
                case tableType.list:
                    length = column;
                    break;
            }
            let title = null;
            for(let j = 0; j<=length; j++) {
                switch (type){
                    case tableType.db:
                        if(j>0) {
                            title = column[j-1].substr(1);
                        }
                        break;
                    case tableType.list:
                        title = j;
                        break;
                }
                data.push(<td className={$class(
                    {"data-empty": j===0&&row===0,
                        "data-column-title": j!==0&&row===0,
                        "data-row-title": j===0&&row!==0,
                        'data': j!==0&&row!==0})} key={j}>
                    {
                        j===0&&row===0
                            ? <div></div>
                            : j!==0&&row===0
                            ? <div>{title}</div>
                            : j===0&&row!==0
                            ? <div>{row}</div>
                            : <div className="data-btn" onClick={this.onClickArrTableData.bind(this, row, j, type)}></div>
                    }
                </td>);
            }
            return data;
        };

        let drawTable = (row, column, type)=>{
            let table = [];
            for(let i = 0; i<=row; i++) {
                table.push(<tr className="data-row" key={i}>
                    {
                        drawRow(i, column, type)
                    }
                </tr>);
            }
            return table;
        };

        return (<div className={$class(this.props.className, 'drop-down-table', {'active':!this.disabled})}
                     tabIndex="-1"
                     ref="arrTable"
                     onBlur={this.onTableBlur}
                     onClick={this.onToggleDropDown}>
            <div className="dropDown-title">选择值</div>
            <span className="right-icon" />
            <div className={$class("dropDown-content", {'hidden': !this.state.dropDownShow || this.props.disabled})}>
                {
                    this.state.isLoading
                        ? <div className={$class("arr-table arr-table-empty")}>加载数据...</div>
                        : this.props.row&&this.props.row>0
                        ? this.props.dbSource&&this.state.dbHeader.length>0
                        ? (<table className={$class("arr-table")}>
                            <tbody>
                            {
                                drawTable(this.props.row, this.state.dbHeader, tableType.db)
                            }
                            </tbody>
                            </table>)
                        : this.props.column&&this.props.column>0
                        ?   (<table className={$class("arr-table")}>
                                <tbody>
                            {
                                drawTable(this.props.row, this.props.column, tableType.list)
                            }
                                </tbody>
                            </table>)
                        : <div className={$class("arr-table arr-table-empty")}>缺少列信息</div>
                        : <div className={$class("arr-table arr-table-empty")}>无行列信息</div>
                }
            </div>
        </div>)
    }
}

export {ArrTableDropDown};