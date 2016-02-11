import { Mongo, ReactiveDict } from 'meteor-standalone-react-mixin'


var Todos = new Mongo.Collection('todos');

// Get any of the Todos that were in LocalStorage
var loadSaved = function() {
    var savedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
    for(var i=0;i<savedTodos.length;i++){
        Todos.insert(savedTodos[i]);
    }
};



var saveInLocalStorage = function() {
    localStorage.setItem('todos', JSON.stringify(Todos.find().fetch()));
};



loadSaved();

/*

 Watch the Todos collection and save the collection
 in LocalStorage when something changes.

 Todos.find() is a query cursor, and when
 there's an 'added', 'changed', or 'removed'
 event these functions are called

*/

Todos.find().observeChanges({
	added: saveInLocalStorage,
	changed: saveInLocalStorage,
	removed: saveInLocalStorage,
});

// Keep track of whether in an editing state
var appState = new ReactiveDict.ReactiveDict;
appState.set('editing', false);


module.exports = {
	Todos: Todos,
	appState: appState
};
