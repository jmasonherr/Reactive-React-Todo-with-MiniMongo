/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React */
import React from 'react'
var classNames = require('classNames');
import { Link } from 'react-router'
import { Todos } from './data.jsx'

var pluralize = function (count, word) {
    return count === 1 ? word : word + 's';
};

var TodoFooter = React.createClass({
	clearCompleted: function(e){
		Todos.remove({completed: true});
	},

	render: function () {
		var clearButton = null;
		var activeTodoWord = pluralize(this.props.count, 'item');

		if (this.props.completedCount > 0) {
			clearButton = (
				<button
					className="clear-completed"
					onClick={this.clearCompleted}>
					Clear completed
				</button>
			);
		}

		return (
			<footer className="footer">
				<span className="todo-count">
					<strong>{this.props.count}</strong> {activeTodoWord} left
				</span>
				<ul className="filters">
					<li>
						<Link
							to="/"
							className={classNames({selected: this.props.location === '/'})}>
								All
						</Link>
					</li>
					{' '}
					<li>
						<Link
							to="/active"
							className={classNames({selected: this.props.location === '/active'})}>
								Active
						</Link>
					</li>
					{' '}
					<li>
						<Link
							to="/completed"
							className={classNames({selected: this.props.location === '/completed'})}>
								Completed
						</Link>
					</li>
				</ul>
				{clearButton}
			</footer>
		);
	}
});

module.exports.TodoFooter = TodoFooter;
