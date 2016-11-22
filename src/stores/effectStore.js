import Reflux from 'reflux';
import Actions from '../actions/effectAction';
import WidgetActions from '../actions/WidgetActions';
import Cookies  from 'js-cookie';

export default Reflux.createStore({
    init: function() {
        this.listenTo(Actions['getEffectList'], this.getEffectList);
        this.listenTo(Actions['createEffectShow'], this.createEffectShow);
        this.listenTo(Actions['createEffect'], this.createEffect);
        this.listenTo(Actions['updateEffect'], this.updateEffect);
        this.listenTo(Actions['deleteEffect'], this.deleteEffect);
        this.token = Cookies.get('ih5token');
    },

    getEffectList: function() {
        WidgetActions['ajaxSend'](this.token, 'POST', 'app/effectList', null, null, function(text) {
            let result = JSON.parse(text);
            console.log(result);
            if (result) {
                this.trigger({effectList : result});
            }
        }.bind(this));
    },

    createEffectShow: function (bool) {
        this.trigger({createEffect : bool});
    },

    createEffect: function(name) {
        WidgetActions['ajaxSend'](this.token, 'POST', 'app/effectCreate', null, name, function(text) {
            let result = JSON.parse(text);
            console.log(result);
            if (result) {

            }
        }.bind(this));
    },

    updateEffect: function(id,data) {
        WidgetActions['ajaxSend'](this.token, 'POST', 'app/effectUpdate/'+ id, null, data, function(text) {
            let result = JSON.parse(text);
            console.log(result);
            if (result) {

            }
        }.bind(this));
    },

    deleteEffect: function(id) {
        WidgetActions['ajaxSend'](this.token, 'POST', 'app/effectDelete'+ id, null, null, function(text) {
            let result = JSON.parse(text);
            console.log(result);
            if (result) {

            }
        }.bind(this));
    }
});

