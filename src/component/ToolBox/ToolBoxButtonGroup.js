import React,{PropTypes, Component} from 'react';
import ToolBoxButton from './ToolBoxButton';
import cls from 'classnames';

import ToolBoxAction from '../../actions/ToolBoxAction';
import ToolBoxStore from '../../stores/ToolBoxStore';

// 工具栏的按钮组（包含多个工具按钮）
class ToolBoxButtonGroup extends Component {
    constructor (props) {
        super(props);
        this.state = {
            secondaryMenuVisible: false
        };
    }

    componentDidMount() {
        this.unsubscribe = ToolBoxStore.listen(this.onStatusChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(store) {
        //console.log('s', store);
        this.setState({
            secondaryMenuVisible: store.openSecondaryId === this.props.gid
        })
    }

    render() {
        // 是否存在次级菜单
        let hasSecondaryMenu = this.props.secondary instanceof Array;

        return (
            <div className={ cls('ToolBoxButtonGroup', {'hasSecondaryMenu': hasSecondaryMenu}) }>
                <ToolBoxButton
                    cid={this.props.primary.cid}
                    gid={this.props.gid}
                    name={this.props.primary.name}
                    icon={this.props.primary.icon}
                    url={this.props.primary.url}
                    isPrimary={true}
                    className={this.props.primary.className}
                    upload={this.props.primary.upload} />
                {
                    !hasSecondaryMenu ? null :
                        <div className={cls('ToolBoxButtonSubGroup', {'visible': this.state.secondaryMenuVisible})}>
                        {
                            this.props.secondary.map((item, index)=>
                                <ToolBoxButton key={index}
                                    cid={item.cid}
                                    gid={this.props.gid}
                                    name={item.name}
                                    icon={item.icon}
                                    url={item.url}
                                    isPrimary={false}
                                    className={item.className}
                                    upload={item.upload} />)
                        }
                        </div>
                }
            </div>
        );
    }
}

ToolBoxButtonGroup.propTypes = {
    name: PropTypes.string,
    gid: PropTypes.number.isRequired,
    primary: PropTypes.object,
    secondary: PropTypes.array
};

module.exports = ToolBoxButtonGroup;
