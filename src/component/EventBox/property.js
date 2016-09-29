//事件的属性
import React from 'react';
import $class from 'classnames'
import WidgetStore, {varType} from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'
import { Menu, Dropdown } from 'antd';
import { Input, InputNumber, Select} from 'antd';
// import { SwitchMore } from  '../PropertyView/PropertyViewComponet';
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
            funcList: null,      //当前目标对象的函数列表
            objectDropdownVisible: false, //是否显示对象的下拉框
            actionDropdownVisible: false, //是否显示动作的下拉框

            currentObject: this.props.specific.object,
            currentAction: this.props.specific.action,  //name&property
        };
        this.expandBtn = this.expandBtn.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onSpecificDelete = this.onSpecificDelete.bind(this);
        this.onSpecificAdd = this.onSpecificAdd.bind(this);

        this.onObjectVisibleChange = this.onObjectVisibleChange.bind(this);
        this.onObjectSelect = this.onObjectSelect.bind(this);
        this.onActionVisibleChange = this.onActionVisibleChange.bind(this);
        this.onActionSelect = this.onActionSelect.bind(this);
        this.onGetActionList = this.onGetActionList.bind(this);
        this.onChangePropDom = this.onChangePropDom.bind(this);
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
                actionList.push({'name':item.name, 'showName':item.showName, 'property':item.property});
         });
        this.setState({
            actionList: actionList
        })
    }

    onSpecificAdd() {
        if(this.state.activeKey !== this.state.wKey) {
            return;
        }
        WidgetActions['addSpecific'](this.state.event);
    }

    onSpecificDelete() {
        if(this.state.activeKey !== this.state.wKey) {
            return;
        }
        WidgetActions['deleteSpecific'](this.state.sid ,this.state.event);

    }

    expandBtn(expanded, event) {
        if(this.state.activeKey !== this.state.wKey) {
            return;
        }
        this.setState({
            expanded: expanded
        });
    }

    onObjectSelect(e){
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
            funcList: object.funcList,
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

    onActionSelect(e){
        e.domEvent.stopPropagation();
        let action = e.item.props.action;
        let property =[];
        if(action.property){
            property = action.property;
        }
        this.setState({
            currentAction: {
                'name': action.name,
                'showName': action.showName,
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

    onChangePropDom(prop, index, e){
        let value = null;
        switch (prop) {
            case prop.String:
                value = e.target.value;
                break;
            case prop.Integer:
            case prop.Float:
                value = e;
                break;
            case prop:Function:
                break;
            default:
                break;
        };
        prop.value = value;
        let property = this.state.currentAction.property;
        property[index] = prop;
        this.setState({
            currentAction: {
                'name': this.state.currentAction.name,
                'property': property,
            },
        });
        WidgetActions['changeSpecific'](this.state.specific, {'property':this.state.currentAction.property});
    }

    render() {
        let content = (v1,i1)=>{
            //设置通用默认参数和事件
            let defaultProp = {
                size: 'small',
                onChange:  this.onChangePropDom.bind(this, v1, i1)
            };
            return  <div className="pp--list f--hlc" key={i1}>
                        <div className="pp--name">{ v1.showName }</div>
                        { type(v1.type, v1.value, defaultProp) }
                    </div>
        };

        let func = (v1, i2)=>{
            return <Option value={v1}>{v1.props.name}</Option>;
        };

        let type = (type, value, defaultProp)=>{
            switch (type) {
                case propertyType.String:
                    return <Input {...defaultProp}/>;
                    {/*return <input {...defaultProp} className="flex-1" type="text" placeholder={value}/>;*/}
                case propertyType.Integer:
                    return <InputNumber {...defaultProp} />;
                    // return <input className="flex-1" type="text" placeholder={value}/>;
                case propertyType.Float:
                    return <InputNumber step={0.1} {...defaultProp} />;
                    {/*return <input className="flex-1" type="text" placeholder={value}/>;*/}
                case propertyType.Function:
                    return <Select defaultValue="目标函数"  {...defaultProp}>
                        {
                            !this.state.funcList||this.state.funcList.length==0
                                ? null
                                : this.state.funcList.map(func)
                        }
                    </Select>;
                default:
                    return <div>未定义类型</div>;
            }
        };


        let objectMenuItem = (v1,i)=>{
            return  <MenuItem key={i} object={v1}>{v1.props.name}</MenuItem>
        };

        let objectMenu = (
            <Menu onClick={this.onObjectSelect}>
                {
                    !this.state.objectList||this.state.objectList.length==0
                        ? null
                        : this.state.objectList.map(objectMenuItem)
                }
            </Menu>
        );

        let actionMenuItem = (v2, i)=>{
            return <MenuItem key={i} action={v2}>{v2.showName}</MenuItem>
        };

        let actionMenu = (
            <Menu onClick={this.onActionSelect}>
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
                    <span className="p--close-line" onClick={this.onSpecificDelete}/>
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

                            <div className="add-btn" onClick={this.onSpecificAdd}>
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
                                            { !this.state.currentAction.showName
                                                ? '目标动作'
                                                : this.state.currentAction.showName
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


