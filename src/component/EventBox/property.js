//事件的属性
import React from 'react';
import $class from 'classnames'
import WidgetStore from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'
import { Menu, Dropdown } from 'antd';

const MenuItem = Menu.Item;

class Property extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            expanded: true,

            activeKey: this.props.activeKey,//当前激活的widgetkey
            event: this.props.event,        //对应的事件
            wid: this.props.wid,      //specfic所在的widgetkey
            specific: this.props.specific,  //specfic
            sid: this.props.specific.sid,

            objectList: null,    //目标对象的列表
            actionList: null,    //对象动作列表
            objectDropdownVisible: false, //是否显示对象的下拉框
            actionDropdownVisible: false, //是否显示动作的下拉框

            currentObject: this.props.specific.object,
            currentAction: this.props.specific.action.name,
            currentProperty: this.props.specific.action.property,    //属性列表
        };
        this.expandBtn = this.expandBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onDeleteSpecific = this.onDeleteSpecific.bind(this);
        this.onAddSpecific = this.onAddSpecific.bind(this);

        this.onObjectVisibleChange = this.onObjectVisibleChange.bind(this);
        this.onSelectObject = this.onSelectObject.bind(this);
        this.onActionVisibleChange = this.onActionVisibleChange.bind(this);
        this.onSelectAction = this.onSelectAction.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.activeKey){
            this.setState({
                activeKey: nextProps.activeKey,
                event: nextProps.event,
                wid: nextProps.wid,
                specific: nextProps.specific,
                sid: nextProps.specific.sid,

                currentObject: nextProps.specific.object,
                currentAction: nextProps.specific.action.name,
                currentProperty: nextProps.specific.action.property,
            });
        }
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {

    }

    onAddSpecific() {
        if(this.state.activeKey == this.state.wid) {
            WidgetActions['addSpecific'](this.state.event);
        }
    }

    onDeleteSpecific() {
        if(this.state.activeKey == this.state.wid) {
            WidgetActions['deleteSpecific'](this.state.sid ,this.state.event);
        }
    }

    expandBtn(expanded, event) {
        event.stopPropagation();
        this.setState({
            expanded: expanded
        });
    }

    onSelectObject(e){
        e.domEvent.stopPropagation();
        this.setState({
            currentObject: e.item.props.object,
            objectDropdownVisible: false
        }, ()=> {
            WidgetActions['changeSpecific'](this.state.specific, {'object':this.state.currentObject});
        });
    }

    onObjectVisibleChange(flag) {
        if(this.state.activeKey == this.state.wid) {
            this.setState({
                objectDropdownVisible: flag
            });
        }
    }

    onSelectAction(e){
        e.domEvent.stopPropagation();
        this.setState({
            currentAction: e.item.props.action,
            actionDropdownVisible: false
        }, ()=> {
            WidgetActions['changeSpecific'](this.state.specific, {'action':this.state.currentAction});
        });
    }

    onActionVisibleChange(flag) {
        if(this.state.activeKey == this.state.wid) {
            this.setState({
                actionDropdownVisible: flag
            });
        }
    }

    render() {
        let content = (v1,i1)=>{
            return  <div className="pp--list f--hlc" key={i1}>
                        <div className="pp--name">{ v1.name }</div>
                        { type(v1.types, v1.value) }
                    </div>
        };

        let type = (num, data)=>{
            if(num == 0){
                return  <input className="flex-1" type="text" placeholder={data}/>
            }
            else if(num == 1){
                let btnp = null;
                let bg =  "none";
                if(data == -1){
                    btnp = 2;
                    bg = "#152322"
                }
                else if (data ==  0){
                    btnp = 33;
                    bg =  "none";
                }
                else {
                    btnp = 67;
                    bg = "#396764";
                }
                return  <div className="on-off-btn f--h">
                            <span className="btn-name left flex-1">ON</span>
                            <div className="btn-icon flex-1"><span style={{ background: bg}} /></div>
                            <span className="btn-name right flex-1">OFF</span>
                            <span className="btn" style={{ marginLeft : btnp + "px" }}/>
                        </div>
            }
            else {
                return  <div className="p--dropDown middle flex-1">
                            <div className="title f--hlc">
                                { data }
                                <span className="icon" />
                            </div>
                            <div className="dropDown"></div>
                        </div>
            }
        };

        let objectMenu = (
            <Menu onClick={this.onSelectObject}>
                <MenuItem key="1" object="11">第一个菜单项</MenuItem>
                <MenuItem key="2" object="12">第二个菜单项</MenuItem>
                <MenuItem key="3" object="13">第三个菜单项</MenuItem>
            </Menu>
        );

        let actionMenu = (
            <Menu onClick={this.onSelectAction}>
                <MenuItem key="1" action="11">A第一个菜单项</MenuItem>
                <MenuItem key="2" action="12">A第二个菜单项</MenuItem>
                <MenuItem key="3" action="13">A第三个菜单项</MenuItem>
            </Menu>
        );

        let propertyId = 'spec-item-'+ this.state.sid;

        return (
            <div className="Property f--h" id={propertyId}>
                <div className="P--left-line"></div>
                <div className="P--content flex-1 f--h">
                    <span className="p--close-line" onClick={this.onDeleteSpecific}/>
                    <div className="p--main flex-1 f--h">
                        <div className="p--left">
                            <div className="p--left-div f--hlc">
                                <button className="p--icon"></button>
                                <Dropdown overlay={objectMenu} trigger={['click']}
                                          getPopupContainer={() => document.getElementById(propertyId)}
                                          onVisibleChange={this.onObjectVisibleChange}
                                          visible={this.state.objectDropdownVisible}>
                                    <div className={$class("p--dropDown short", {'active':this.state.objectDropdownVisible})}>
                                        <div className="title f--hlc">
                                            { this.state.currentObject===null
                                                ?'目标对象'
                                                :this.state.currentObject
                                            }
                                            <span className="icon" />
                                        </div>
                                    </div>
                                </Dropdown>
                            </div>

                            <div className="add-btn" onClick={this.onAddSpecific}>
                                <div className="btn-layer">
                                    <span className="heng"/>
                                    <span className="shu"/>
                                </div>
                            </div>
                        </div>

                        <div className="p--right flex-1">
                            <div className="p--property">
                                <Dropdown overlay={actionMenu} trigger={['click']}
                                          getPopupContainer={() => document.getElementById(propertyId)}
                                          onVisibleChange={this.onActionVisibleChange}
                                          visible={this.state.actionDropdownVisible}>
                                    <div className={$class("p--dropDown long", {'active':this.state.actionDropdownVisible})}>
                                        <div className="title f--hlc">
                                            <span className="pp--icon" />
                                            { this.state.currentAction===null
                                                ? '目标动作'
                                                : this.state.currentAction
                                            }
                                            <span className="icon" />
                                        </div>
                                    </div>
                                </Dropdown>
                                {/*是否展开属性内容*/}
                                <div className={$class("pp-content f--h", {'hidden': !this.state.expanded} )}>
                                    {
                                        !this.state.currentProperty || this.state.currentProperty.length === 0
                                            ? null
                                            : <div className="pp--list-layer flex-1">
                                            {
                                                this.state.currentProperty.map(content)
                                            }
                                        </div>
                                    }
                                </div>

                                <button className={$class("up-btn", {'expanded-props': this.state.expanded})}
                                        onClick={this.expandBtn.bind(this, false)}
                                        disabled={this.state.currentProperty.length==0}>
                                    <div className="btn-layer">
                                    </div>
                                </button>
                                <button className={$class("down-btn", {'expanded-props': (this.state.expanded)})}
                                        onClick={this.expandBtn.bind(this, true)}
                                        disabled={this.state.currentProperty.length==0}>
                                    <div className="btn-layer">
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = Property;


