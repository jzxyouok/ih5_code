var Reflux = require('reflux');

var TimelineAction = require('../actions/TimelineAction.js');


var TimelineStores = Reflux.createStore({
        init: function() {
            this.listenTo(TimelineAction.ChangeKeyframe,this.ChangeKeyframe);
        },

        ChangeKeyframe: function(bool,value) {
            this.trigger(bool,value);
        }
    }
);

module.exports = TimelineStores; //Finally, export the Store