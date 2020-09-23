import React from 'react'
import * as serviceWorker from './serviceWorker'
import ReactDOM from 'react-dom'

import ProjectsPage from 'pages/ProjectsPage'
import TasksPage from 'pages/TasksPage'
import StatisticsPage from 'pages/StatisticsPage/StatisticsPage'
import { Router, Switch, Route } from 'wouter'
import { useHashLocation } from 'hooks'
//import Tailwind from './Tailwind'

//import './styles.css'

import Navbar from 'components/Navbar'
import './tailwind.css'

function App() {
  return (
    <Router hook={useHashLocation}>
      <Navbar />
      <Switch>
        <Route path="/" component={ProjectsPage} />
        <Route path="/statistics/:projectId?" component={StatisticsPage} />
        <Route path="/:projectId" component={TasksPage} />
      </Switch>
    </Router>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

serviceWorker.register()
