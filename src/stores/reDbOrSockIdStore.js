var Reflux = require('reflux');

var ReDbOrSockIdAction = require('../actions/ReDbOrSockIdAction.js');


var ReDbOrSockIdStore = Reflux.createStore({
        init: function() {
            this.listenTo(ReDbOrSockIdAction.reDbOrSockId,this.reDbOrSockId);
        },

        reDbOrSockId: function(type,value) {
            this.trigger(type,value);
        }
    }
);

module.exports = ReDbOrSockIdStore;