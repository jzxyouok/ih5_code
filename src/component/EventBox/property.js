//事件的属性
import React from 'react';
import $class from 'classnames'
import WidgetStore, {varType} from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'
import { Menu, Dropdown } from 'antd';
import { propertyMap, propertyType } from '../PropertyMap'

const MenuItem = Menu.Item;

class Property extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            expanded: true,
            activeKey: this.props.activeKey,//当前激活的widgetkey
            event: this.props.event,        //对应的事件
            wKey: this.props.wKey,      //specfic所在的widgetkey
            specific: this.props.specific,  //specfic
            sid: this.props.specific.sid,

            objectList: null,    //目标对象的列表
            actionList: null,    //对象动作列表
            objectDropdownVisible: false, //是否显示对象的下拉框
            actionDropdownVisible: false, //是否显示动作的下拉框

            currentObject: this.props.specific.object,
            currentAction: this.props.specific.action,  //name&property
        };
        this.expandBtn = this.expandBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onDeleteSpecific = this.onDeleteSpecific.bind(this);
        this.onAddSpecific = this.onAddSpecific.bind(this);

        this.onObjectVisibleChange = this.onObjectVisibleChange.bind(this);
        this.onSelectObject = this.onSelectObject.bind(this);
        this.onActionVisibleChange = this.onActionVisibleChange.bind(this);
        this.onSelectAction = this.onSelectAction.bind(this);
        this.onGetActionList = this.onGetActionList.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.activeKey){
            this.setState({
                activeKey: nextProps.activeKey,
                event: nextProps.event,
                wKey: nextProps.wKey,
                specific: nextProps.specific,
                sid: nextProps.specific.sid,

                currentObject: nextProps.specific.object,
                currentAction: nextProps.specific.action
            }, ()=>{
                //获取动作
                if(this.state.currentObject.className){
                    this.onGetActionList(this.state.currentObject.className, this.state.currentObject.type);
                }
            });
        }
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getAllWidgets());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if(!widget) {
            return;
        }
        if(widget.allWidgets){
            this.setState({
                objectList: widget.allWidgets
            });
        }
    }

    onGetActionList(classname, type){
        let actionList = [];
        let className = classname;
        if(className === 'var'){
            switch (type) {
                case varType.number:
                    className = 'intVar';
                    break;
                case varType.string:
                    className = 'strVar';
                    break;
                default:
                    break;
            }
        }
        propertyMap[className].map((item, index) => { 
            if (item.isFunc)
                actionList.push({'name': item.name, 'property': item.property});
         });
        this.setState({
            actionList: actionList
        })
    }

    onAddSpecific() {
        if(this.state.activeKey == this.state.wKey) {
            WidgetActions['addSpecific'](this.state.event);
        }
    }

    onDeleteSpecific() {
        if(this.state.activeKey == this.state.wKey) {
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
        let object = e.item.props.object;
        let currentObj =  {
            name:object.props.name,
            id:object.props.id,
            className: object.className
        };
        if(object.className === 'var'){
            currentObj.type = object.type;
        }
        this.setState({
            currentObject: currentObj,
            objectDropdownVisible: false
        }, ()=> {
            WidgetActions['changeSpecific'](this.state.specific, {'object':this.state.currentObject});
        });
    }

    onObjectVisibleChange(flag) {
        if(this.state.activeKey == this.state.wKey) {
            this.setState({
                objectDropdownVisible: flag
            });
        }
    }

    onSelectAction(e){
        e.domEvent.stopPropagation();
        let action = e.item.props.action;
        let property =[];
        if(action.property){
            property = action.property;
        }
        this.setState({
            currentAction: {
                'name': action.name,
                'property': property,
            },
            actionDropdownVisible: false
        }, ()=> {
            WidgetActions['changeSpecific'](this.state.specific, {'action':this.state.currentAction});
        });
    }

    onActionVisibleChange(flag) {
        if(this.state.activeKey == this.state.wKey) {
            this.setState({
                actionDropdownVisible: flag
            });
        }
    }

    render() {
        let content = (v1,i1)=>{
            return  <div className="pp--list f--hlc" key={i1}>
                        <div className="pp--name">{ v1.name }</div>
                        { type(v1.type, v1.value, i1) }
                    </div>
        };

        let type = (type, value, i1)=>{
            switch (type) {
                case propertyType.String:
                    return <input className="flex-1" type="text" placeholder={value}/>;
                    break;
                case propertyType.Integer:
                    return <input className="flex-1" type="text" placeholder={value}/>;
                    break;
                case propertyType.Float:
                    return <input className="flex-1" type="text" placeholder={value}/>;
                    break;
                case propertyType.Function:
                    return <div>目标对象的函数列表</div>;
                    break;
                default:
                    return <div>未定义类型</div>;
            }

            // if(type == propertyType.String){
            //     return  <input className="flex-1" type="text" placeholder={data}/>
            // }
            // else if(type == 1){
            //     let btnp = null;
            //     let bg =  "none";
            //     if(data == -1){
            //         btnp = 2;
            //         bg = "#152322"
            //     }
            //     else if (data ==  0){
            //         btnp = 33;
            //         bg =  "none";
            //     }
            //     else {
            //         btnp = 67;
            //         bg = "#396764";
            //     }
            //     return  <div className="on-off-btn f--h">
            //                 <span className="btn-name left flex-1">ON</span>
            //                 <div className="btn-icon flex-1"><span style={{ background: bg}} /></div>
            //                 <span className="btn-name right flex-1">OFF</span>
            //                 <span className="btn" style={{ marginLeft : btnp + "px" }}/>
            //             </div>
            // }
            // else {
            //     return  <div className="p--dropDown middle flex-1">
            //                 <div className="title f--hlc">
            //                     { data }
            //                     <span className="icon" />
            //                 </div>
            //                 <div className="dropDown"></div>
            //             </div>
            // }
        };


        let objectMenuItem = (v1,i)=>{
            return  <MenuItem key={i} object={v1}>{v1.props.name}</MenuItem>
        };

        let objectMenu = (
            <Menu onClick={this.onSelectObject}>
                {
                    !this.state.objectList||this.state.objectList.length==0
                        ? null
                        : this.state.objectList.map(objectMenuItem)
                }
            </Menu>
        );

        let actionMenuItem = (v2, i)=>{
            return <MenuItem key={i} action={v2}>{v2.name}</MenuItem>
        };

        let actionMenu = (
            <Menu onClick={this.onSelectAction}>
                {
                    !this.state.actionList||this.state.actionList.length==0
                        ? null
                        : this.state.actionList.map(actionMenuItem)
                }
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
                                            { !this.state.currentObject.name
                                                ?'目标对象'
                                                :this.state.currentObject.name
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
                                            { !this.state.currentAction.name
                                                ? '目标动作'
                                                : this.state.currentAction.name
                                            }
                                            <span className="icon" />
                                        </div>
                                    </div>
                                </Dropdown>
                                {/*是否展开属性内容*/}
                                <div className={$class("pp-content f--h", {'hidden': !this.state.expanded} )}>
                                    {
                                        !this.state.currentAction.property || this.state.currentAction.property.length === 0
                                            ? null
                                            : <div className="pp--list-layer flex-1">
                                            {
                                                this.state.currentAction.property.map(content)
                                            }
                                        </div>
                                    }
                                </div>

                                <button className={$class("up-btn", {'expanded-props': this.state.expanded})}
                                        onClick={this.expandBtn.bind(this, false)}
                                        disabled={!this.state.currentAction.property || this.state.currentAction.property.length==0}>
                                    <div className="btn-layer">
                                    </div>
                                </button>
                                <button className={$class("down-btn", {'expanded-props': (this.state.expanded)})}
                                        onClick={this.expandBtn.bind(this, true)}
                                        disabled={!this.state.currentAction.property || this.state.currentAction.property.length==0}>
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


