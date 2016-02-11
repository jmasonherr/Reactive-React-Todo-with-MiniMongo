# React TodoMVC with Minimongo
How do you manage data with React.js?

Build the frontend like the backend - with a database.  React is a JavaScript library for creating user interfaces.  Minimongo is MongoDB, in your browser. When the database changes, the UI automagically propagates to React.

Minimongo is built by the [Meteor](http://docs.meteor.com/) team.  It is heavily tested and [well documented](http://docs.meteor.com/#/full/mongo_collection). This package is a standalone fork of MDG's [React mixin](https://github.com/meteor/react-packages/blob/devel/packages/react-meteor-data/meteor-data-mixin.jsx)

This package shows how simple it can be.  It is adapted from the React Todo but has much less code.

## Installation

```
git clone https://github.com/ivanthedeployer/todo
cd todo
npm install
webpack   # or ./node_modules/.bin/webpack if that gives an error
npm start
```

Navigate to  http://localhost:8080.

## Walkthrough

```
import { Mongo, ReactiveDict } from 'meteor-standalone-react-mixin'

var Todos = new Mongo.Collection('todos');
...
var appState = new ReactiveDict;
```

`Mongo.Collection` is a reactive database collection very similar to MongoDB's collections.  Each item in the collection has a unique `_id` property. We create one to hold our `Todos`. 

`ReactiveDict` is like a javascript dictionary with getters and setters, and it is also reactive.  It keeps track of the application's state.  Any change in this will also cause a refresh in components that depend on it.

Now that we have a place to store data and application state, we can write the views

```
import { Todos, appState } from './todo/data.jsx'
import { TodoItem } from './todo/todoItem.jsx'
import { ReactiveMixin } from 'meteor-standalone-react-mixin'


const TodoApp = React.createClass({
    // To make a React class react to a reactive data source, add this mixin
    mixins: [ReactiveMixin],

    getMeteorData: function () {
        var queryFilters = {};
        /* 
          Any Reactive data sources queried in this function will trigger a refresh when they change. This view will watch Mongo.Collection queries and appState, a ReactiveDict

           Location of the page is passed in as a prop from React-Router, when props or state change, this function will run to see if its results change
        */

        var _location = this.props.location.pathname;

        // Mongo.Collection allows a rich query interface (nearly all //  of MongoDB's!) including sort statements
        var sortStatement = {sort: {createdAt: -1}};
        if(_location === '/active') {
            queryFilters.completed = false;
            sortStatement.sort = {completedAt: -1, createdAt: -1};
        }
        else if(_location === '/completed'){
            queryFilters.completed = true;
            sortStatement.sort = {completedAt: -1};
        }

        // Anything returned from getMeteor data is available as this.data to 
        // the rest of the class
        return {
            editingState: appState.get('editing'),
            // Count queries are reactive too!
            activeTodoCount: Todos.find({completed: false}).count(),
            completedCount: Todos.find({completed: true}).count(),
            location: _location,
            todos: Todos.find(queryFilters, sortStatement).fetch()
        };
    },

```

Now any changes made to `Todos`, the window location, or `appState` will automagically show up on `this.data`. So the `render` function looks like this-

```
    ...
    render: function () {
        var self = this;
        var footer;
        var main;
        var todoItems = this.data.todos.map(function (todo) {
            return (
                <TodoItem
                    key={todo._id}
                    todo={todo}
                    editing={self.data.editingState === todo._id}
                    onCancel={self.cancel}/>);
        }, this);

        if (this.data.activeTodoCount || this.data.completedCount) {
            footer =
                <TodoFooter
                    count={this.data.activeTodoCount}
                    completedCount={this.data.completedCount}
                    location={this.data.location} />;
        }

        if (this.data.todos.length) {
            main = (
                <section className="main">
                    <input
                        className="toggle-all"
                        type="checkbox"
                        onChange={this.toggleAll}
                        checked={this.data.activeTodoCount === 0} />
                    <ul className="todo-list">
                        {todoItems}
                    </ul>
                </section>
            );
        }

        return (
            <div>
                <header className="header">
                    <h1>todos</h1>
                    <input
                        className="new-todo"
                        placeholder="What needs to be done?"
                        autoFocus={true}
                        onKeyUp={this.handleKeyUp} />
                </header>
                {main}
                {footer}
            </div>
        );
    }

```

How to insert a new `Todo`?  Look at the `handleKeyUp` method in `App.jsx`

```
    handleKeyUp: function (event) {
        ...

        var val = event.target.value.trim();

        if (val) {
            Todos.insert({
                title: val,
                completed: false,
                createdAt: new Date(),
                completedAt: null,
            });
            event.target.value = '';
        }
    },
```

`TodoApp` will rerender automatically,a new `Todo` will show in the UI and the footer will appear.  It only has two more methods to cover

```
    ...
    toggleAll: function (event) {
        // Toggle the state of all Todos present, 
        if(Todos.find({completed: false}).count()){
            Todos.update({completed: false}, {$set: {completed: true, completedAt: new Date()}}, {multi:true});
        } else {
            Todos.update({}, {$set: {completed: false, completedAt: null}}, {multi: true});
        }
    },

    clearCompleted: function () {
        // Remove all completed Todos
        Todos.remove({completed: true});
    },
    ...
```


That's it.  Now we can create Todos, toggle their status in bulk, or clear completed todos.  Unlike most React code the rest of the methods are on `TodoItem`.  Usually functions from `TodoApp` are passed as props to its children, but since `Todos` is available to `TodoItem`, we don't have to.

Updating a `Todo` is handled by its own view.  No need to `.apply` variables in the parent

```
var TodoItem = React.createClass({
    ...
    toggle: function (event){
        // Update takes a selector as its first ID, either an _id or a Mongo query
        Todos.update(this.props.todo._id, {
            $set: {
                completed: !this.props.todo.completed,
                completedAt: this.props.todo.completed ? null : new Date()
            }
        });
    },
```

Deletion also happens in  `TodoItem`

```
import { Todos, appState } from './data.jsx'

var TodoItem = React.createClass({
    ...
    destroy: function() {
        Todos.remove(this.props.todo._id);
    },
```

In both `update` and `remove`, the parent collection is immediately notified, and the UI changes.  Easy as that.

The following fires on `onKeyUp` when editing a `Todo`

```
    handleKeyUp: function (event) {
        var val = event.target.value.trim();
        if (event.which === ESCAPE_KEY) {
            // This is the ReactiveDict from earlier. More on that later
            appState.set('editing', false);
        } else if (event.which === ENTER_KEY) {
            if (val) {
                Todos.update(this.props.todo._id, {
                    $set: {title: val}
                });
                appState.set('editing', false);
            } else {
                this.destroy();
            }
        }
    },
```

`update`, like `findOne` and `remove` can take an `_id` as a selector.  `appState` is a ReactiveDict.  Changes in its value are observed by `TodoApp`

#### What is 'appState' doing? 

`appState` is reactive too.  Its api has `.get(key)` and `.set(key, val)` methods. Only 1 `Todo` can be edited at a time.  `TodoApp` is observing its value and passing it to the `TodoItems`.  There are likely more elegant solutions, but this showcases its functionality.

#### Observing a Collection query outside of getMeteorData

Sometimes you don't want a whole React class just to watch a collection. This is when `.observeChanges` is handy.  In this case, the entire `Todos` collection is persisted to `localStorage` when a document is `added`, `changed`, or `removed`.

```
var saveInLocalStorage = function() {
    localStorage.setItem('todos', JSON.stringify(Todos.find().fetch()));
};

Todos.find().observeChanges({
    added: saveInLocalStorage,
    changed: saveInLocalStorage,
    removed: saveInLocalStorage,
});
```

[More info on `.observeChanges` and its sister functions](http://docs.meteor.com/#/full/observe_changes)

## Benefits

* Use a database! Everybody loves a database!
* Super simple!
* Automatic UI updates!
* Jargon free! (except maybe [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming)) 

## Under the hood

MiniMongo is built on [Tracker](https://www.meteor.com/tracker), a tiny reactivity library built by MDG.  This, along with their [React integration mixin](https://github.com/meteor/react-packages/blob/devel/packages/react-meteor-data/meteor-data-mixin.jsx) have been packaged by this library for standalone use with minimal modifications.  

Now that you don't have to write as much code, here are the docs-

### Further Documentation
* [MiniMongo](http://docs.meteor.com/#/full/mongo_collection)
* [Tracker](https://www.meteor.com/tracker)
* [Mongo Query Syntax](https://docs.mongodb.org/manual/tutorial/query-documents/)
* [React Documentation](http://facebook.github.io/react/docs/getting-started.html)
* [React API Reference](http://facebook.github.io/react/docs/reference.html)
* [Meteor docs](http://docs.meteor.com/#/full)


