var Reflux = require('reflux');

var PixelActions = require('../actions/NoteActions');


var PixelStores = Reflux.createStore({
init: function() {
    // Here we listen to actions and register callbacks
    this.listenTo(PixelActions.createScene, this.onCreateScene);
},

onCreateScene: function(note) {

    // Trigger an event once done so that our components can update. Also pass the modified list of notes.
    this.trigger(_notes);
}

}});module.exports = PixelStores; //Finally, export the Store