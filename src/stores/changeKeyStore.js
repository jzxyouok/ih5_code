var Reflux = require('reflux');

var changeKeyAction = require('../actions/changeKeyAction.js');


var ChangeKeyStore = Reflux.createStore({
        init: function() {
            this.listenTo(changeKeyAction.ChangeKey,this.ChangeKey);
        },

        ChangeKey: function(bool,value) {
            this.trigger(bool,value);
        }
    }
);

module.exports = ChangeKeyStore;
