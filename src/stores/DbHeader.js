var Reflux = require('reflux');

var DbHeaderAction = require('../actions/DbHeader.js');


var DbHeaderStores = Reflux.createStore({
        init: function() {
            this.listenTo(DbHeaderAction.DbHeaderData,this.DbHeaderData);
        },

        DbHeaderData: function(value) {
            this.trigger(value);
        }
    }
);

module.exports = DbHeaderStores; //Finally, export the Store
