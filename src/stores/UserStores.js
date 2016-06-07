var Reflux = require('reflux');

var PixelActions = require('../actions/Actions');


var PixelStores = Reflux.createStore({
    init: function() {
        this.listenTo(PixelActions.login,this.onLogin);
    },

    onLogin: function() {
        this.trigger(PixelActions.createScene);

        this.trigger
    },

    onCreateScene: function(note) {
        this.trigger(_notes);
    }

}
);

module.exports = PixelStores; //Finally, export the Store