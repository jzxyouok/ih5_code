var Reflux = require('reflux');

var getSockListAction = require('../actions/getSockListAction.js');


var getSockListStore = Reflux.createStore({
    init: function() {
        this.listenTo(getSockListAction.getSockList,this.getSockList);
    },

    getSockList: function(value) {
        this.trigger(value);
    }
});

module.exports = getSockListStore;