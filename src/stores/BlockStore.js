import Reflux from 'reflux';
import Actions from '../actions/BlockAction';
import WidgetActions from '../actions/WidgetActions';
import Cookies  from 'js-cookie';

let ContentType = "application/json";

export default Reflux.createStore({
    init: function() {
        this.listenTo(Actions['getBlockList'], this.getBlockList);
        this.listenTo(Actions['createBlock'], this.createBlock);
        this.listenTo(Actions['updateBlock'], this.updateBlock);
        this.listenTo(Actions['deleteBlock'], this.deleteBlock);
        this.listenTo(Actions['getBlockSpec'], this.getBlockSpec);
        this.token = Cookies.get('ih5token');
    },

    getBlockList: function() {
        WidgetActions['ajaxSend'](this.token, 'POST', 'app/sModlList', null, null, function(text) {
            let result = JSON.parse(text);
            if (result) {
                let allData = result;
                this.trigger({blockList : allData});
            }
        }.bind(this));
    },

    createBlock: function(name, data) {
        let temp = {name: name, data: data};
        let blockData = JSON.stringify(temp);
        WidgetActions['ajaxSend'](this.token, 'POST', 'app/sModlCreate', ContentType, blockData, function(text){
            let result = JSON.parse(text);
            if (result) {
                this.getBlockList();
            }
        }.bind(this));
    },

    updateBlock: function (name, id, data) {
        let temp = {name: name, data: data};
        let blockData = JSON.stringify(temp);
        WidgetActions['ajaxSend'](this.token, 'POST', 'app/sModlUpdate/'+ id, ContentType, blockData, function(text) {
            let result = JSON.parse(text);
            if (result) {
                this.getBlockList();
            }
        }.bind(this));
    },

    deleteBlock: function (ids) {
        let finished = 0;
        ids.forEach((id)=>{
            WidgetActions['ajaxSend'](this.token, 'POST', 'app/sModlDelete/'+ id, null, null, function(text) {
                let result = JSON.parse(text);
                //console.log(result);
                if (result) {
                    finished +=1;
                    if(ids.length === finished) {
                        this.getBlockList();
                    }
                }
            }.bind(this));
        })
    },

    getBlockSpec: function (id) {

    },

    addBlockToWidget: function (name, id) {
        WidgetActions['ajaxSend'](this.token, 'POST', 'app/sModlGet/'+ id, null, null, function(text) {
            let result = JSON.parse(text);
            if (result) {
                WidgetActions['addBlockToCurrentWidget'](result.data);
            }
        }.bind(this));
    },
})