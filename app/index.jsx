import React from 'react'
import { Route, Router, browserHistory, RouteHandler, RoutingContext } from 'react-router'
import { render } from 'react-dom'

import TodoApp from './components/App.jsx'


render(
  <Router history={browserHistory}>
    <Route component={TodoApp}>
      <Route path="/" component={TodoApp}>
        <Route path="all" component={TodoApp} />
        <Route path="completed" component={TodoApp} />
        <Route path="active" component={TodoApp} />
      </Route>
    </Route>
  </Router>
, document.getElementById('app')
)
