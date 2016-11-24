import Reflux from 'reflux';
import Actions from '../actions/effectAction';
import WidgetActions from '../actions/WidgetActions';
import Cookies  from 'js-cookie';
import $ from 'jquery'

//let domainName = "http://test-beta.ih5.cn/editor3b/";
let ContentType = "application/json";
let systemList = [];

export default Reflux.createStore({
    init: function() {
        this.listenTo(Actions['getEffectList'], this.getEffectList);
        this.listenTo(Actions['createEffectShow'], this.createEffectShow);
        this.listenTo(Actions['createEffect'], this.createEffect);
        this.listenTo(Actions['updateEffect'], this.updateEffect);
        this.listenTo(Actions['deleteEffect'], this.deleteEffect);
        this.listenTo(Actions['toggleMode'], this.toggleMode);
        this.listenTo(Actions['loadEffect'], this.loadEffect);
        this.listenTo(Actions['getSpecificEffect'], this.getSpecificEffect);
        this.listenTo(Actions['returnStart'], this.returnStart);
        this.listenTo(Actions['effectToggleTrack'], this.effectToggleTrack);
        this.token = Cookies.get('ih5token');
        this.system();
    },

    system: function(){
        WidgetActions['ajaxSend'](this.token, 'POST', 'app/effectSystemList', null, null, function(text) {
            let result = JSON.parse(text);
            //console.log(result);
            if (result) {
                systemList = result;
            }
        }.bind(this));
    },

    getEffectList: function() {

        WidgetActions['ajaxSend'](this.token, 'POST', 'app/effectList', null, null, function(text) {
            let result = JSON.parse(text);
            //console.log(result);
            if (result) {
                let allData = [];
                Array.prototype.push.apply(allData, result);
                Array.prototype.push.apply(allData, systemList);
                //console.log(Array);
                this.trigger({effectList : allData});
            }
        }.bind(this));
    },

    createEffectShow: function (bool,name) {
        this.trigger({createEffectShow : bool, effectName : name});
    },

    createEffect: function(data) {
        //console.log(data);
        let effectData = JSON.stringify(data);
        WidgetActions['ajaxSend'](this.token, 'POST', 'app/effectCreate', ContentType, effectData, function(text){
            let result = JSON.parse(text);
            //console.log(result);
            if (result) {
                this.trigger({createEffect : data.name});
                this.getEffectList();
            }
        }.bind(this));
    },

    updateEffect: function(id,data) {
        let effectData = JSON.stringify(data);
        WidgetActions['ajaxSend'](this.token, 'POST', 'app/effectUpdate/'+ id, ContentType, effectData, function(text) {
            let result = JSON.parse(text);
            //console.log(result);
            if (result) {
                this.getEffectList();
                this.trigger({updateEffect : true});
            }
        }.bind(this));
    },

    deleteEffect: function(id) {
        WidgetActions['ajaxSend'](this.token, 'POST', 'app/effectDelete/'+ id, null, null, function(text) {
            let result = JSON.parse(text);
            //console.log(result);
            if (result) {
                this.getEffectList();
            }
        }.bind(this));
    },

    toggleMode: function(data){
        this.trigger({toggleMode : data});
    },

    loadEffect:function(tool,data){
        this.trigger({loadEffect : true, effectName : data});
    },

    getSpecificEffect : function(bool,id){
        WidgetActions['ajaxSend'](this.token, 'POST', 'app/effectGet/'+ id, null, null, function(text) {
            let result = JSON.parse(text);
            if (result) {
                if(bool){
                    this.trigger({addSpecificEffect : result});
                }
                else {
                    this.trigger({loadSpecificEffect : result});
                }
            }
        }.bind(this));
    },

    returnStart:function(){
        this.trigger({returnStart : true});
    },

    effectToggleTrack:function(){
        this.trigger({effectToggleTrack : true});
    }
});

