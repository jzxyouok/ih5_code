/**
 * Created by Brian on 31/10/2016.
 */
import React from 'react';
import $class from 'classnames'

class ArrTableDropDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dropDownShow: false
        };
        this.onClickArrTableData = this.onClickArrTableData.bind(this);
        this.onToggleDropDown = this.onToggleDropDown.bind(this);
        this.onTableBlur = this.onTableBlur.bind(this);
    }

    onClickArrTableData(row, column, e) {
        e.stopPropagation();
        this.setState({
            dropDownShow: false
        }, ()=>{
            this.props.onChange(row, column);
        })
    }

    onToggleDropDown(e) {
        e.stopPropagation();
        if(this.props.onClick) {
            this.props.onClick();
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
        let drawRow = (row, column)=> {
            let data = [];
            for(let j = 0; j<=column; j++) {
                data.push(<td className={$class(
                    {"data-empty": j===0&&row===0,
                        "data-row-title": j!==0&&row===0,
                        "data-column-title": j===0&&row!==0,
                        'data': j!==0&&row!==0})} key={j}>
                    {
                        j===0&&row===0
                            ? <div></div>
                            : j!==0&&row===0
                            ? <div>{j}</div>
                            : j===0&&row!==0
                            ? <div>{row}</div>
                            : <div className="data-btn" onClick={this.onClickArrTableData.bind(this, row, j)}></div>
                    }
                </td>);
            }
            return data;
        };

        let drawTable = (row, column)=>{
            let table = [];
            for(let i = 0; i<=row; i++) {
                table.push(<tr className="data-column f--hlc" key={i}>
                    {
                        drawRow(i, column)
                    }
                </tr>);
            }
            return table;
        };

        return (<div className={$class(this.props.className, 'drop-down-table', {'active':!this.disabled})}
                     tabIndex="-1"
                     ref="arrTable"
                     onBlur={this.onTableBlur}>
            <div className="dropDown-title" onClick={this.onToggleDropDown}>选择值</div>
            <span className="right-icon" />
            <div className={$class("dropDown-content", {'hidden': !this.state.dropDownShow || this.props.disabled})}>
                {
                    this.props.column&&this.props.column>0&&this.props.row&&this.props.row>0
                        ? (<table className={$class("arr-table")}>
                        <tbody>
                        {

                            drawTable(this.props.row, this.props.column)
                        }
                        </tbody>
                    </table>)
                        :<div className={$class("arr-table arr-table-empty")}>无行列信息</div>
                }
            </div>
        </div>)
    }
}

export {ArrTableDropDown};