import React from 'react'

import { TodoFooter } from './todo/footer.jsx'
import { Todos, appState } from './todo/data.jsx'
import { TodoItem } from './todo/todoItem.jsx'
import { ReactiveMixin } from 'meteor-standalone-react-mixin'


// function is_server() {
//    return ! (typeof window != 'undefined' && window.document);
// }
// window.Meteor = {isServer: is_server()};


// Go home to all TODOs to begin with

var ENTER_KEY = 13;

const TodoApp = React.createClass({
	mixins: [ReactiveMixin],

	getMeteorData: function () {
		var queryFilters = {};
		var _location = this.props.location.pathname;
		var sortStatement = {sort: {createdAt: -1}};
		if(_location === '/active') {
			queryFilters.completed = false;
			sortStatement.sort = {completedAt: -1, createdAt: -1};
		}
		else if(_location === '/completed'){
			queryFilters.completed = true;
			sortStatement.sort = {completedAt: -1};
		}
		return {
			editingState: appState.get('editing'),
			activeTodoCount: Todos.find({completed: false}).count(),
			completedCount: Todos.find({completed: true}).count(),
			location: _location,
			todos: Todos.find(queryFilters, sortStatement).fetch()
		};
	},

	handleKeyUp: function (event) {
		if (event.keyCode !== ENTER_KEY) {
			return;
		}
		event.preventDefault();

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

	toggleAll: function (event) {
		if(Todos.find({completed: false}).count()){
			Todos.update({completed: false}, {$set: {completed: true, completedAt: new Date()}}, {multi:true});
		} else {
			Todos.update({}, {$set: {completed: false, completedAt: null}}, {multi: true});
		}
	},

	clearCompleted: function () {
		Todos.remove({completed: true});
	},

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
});

export default TodoApp
