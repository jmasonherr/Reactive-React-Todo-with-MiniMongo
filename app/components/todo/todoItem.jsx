/*jshint quotmark: false */
/*jshint white: false */
/*jshint trailing: false */
/*jshint newcap: false */
/*global React */
var React = require('react')
var ReactDOM = require('react-dom')
var classNames = require('classNames')
import { Todos, appState } from './data.jsx'

var ESCAPE_KEY = 27;
var ENTER_KEY = 13;


var TodoItem = React.createClass({

	handleSubmit: function (event) {

	},

	destroy: function() {
		Todos.remove(this.props.todo._id);
	},

	edit: function () {
		appState.set('editing', this.props.todo._id);
		var input = ReactDOM.findDOMNode(this.refs.editField);
		input.value = this.props.todo.title;
		input.focus();
	},

	cancelEdit: function(){
		appState.set('editing', false);
	},

	handleKeyUp: function (event) {
		if (event.which === ESCAPE_KEY) {
			appState.set('editing', false);
		} else if (event.which === ENTER_KEY) {
			var val = event.target.value.trim();
			if (val) {
				Todos.update(this.props.todo._id, {
					$set: {
						title: val
					}
				});
				appState.set('editing', false);
			} else {
				this.destroy();
			}
		}
	},

	toggle: function (event){
		Todos.update(this.props.todo._id, {
			$set: {
				completed: !this.props.todo.completed,
				completedAt: this.props.todo.completed ? null : new Date()
			}
		});
	},
	render: function () {
		return (
			<li className={classNames({
				completed: this.props.todo.completed,
				editing: this.props.editing
			})}>
				<div className="view">
					<input
						className="toggle"
						type="checkbox"
						checked={this.props.todo.completed}
						onChange={this.toggle}
					/>
					<label onDoubleClick={this.edit}>
						{this.props.todo.title}
					</label>
					<button className="destroy" onClick={this.destroy} />
				</div>
				<input
					ref="editField"
					className="edit"
					onKeyUp={this.handleKeyUp}
				/>
			</li>
		);
	}
});

module.exports.TodoItem = TodoItem;
