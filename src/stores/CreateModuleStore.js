var Reflux = require('reflux');

var CreateModuleAction = require('../actions/CreateModuleAction.js');


var CreateModuleStore = Reflux.createStore({
        init: function() {
            this.listenTo(CreateModuleAction.createModule,this.createModule);
        },

        createModule: function(bool) {
            this.trigger(bool);
        }
    }
);

module.exports = CreateModuleStore;

