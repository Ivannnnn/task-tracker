import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import './styles.css'
import ProjectsPage from 'pages/ProjectsPage'
import TasksPage from 'pages/TasksPage'
import StatisticsPage from 'pages/StatisticsPage'
import { Switch, Route } from 'wouter'

function App() {
  return (
    <Switch>
      <Route path="/" component={ProjectsPage} />
      <Route path="/statistics/:projectId?" component={StatisticsPage} />
      <Route path="/:projectId" component={TasksPage} />
    </Switch>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
