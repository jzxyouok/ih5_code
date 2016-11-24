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

    },

    createBlock: function() {

    },

    updateBlock: function () {

    },

    deleteBlock: function () {

    },

    getBlockSpec: function () {

    },
})