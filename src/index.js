import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import './styles.css'
import Projects from 'components/Projects'
import Tasks from 'components/Tasks'
import Statistics from 'components/Statistics'
import { Switch, Route } from 'wouter'

function App() {
  return (
    <Switch>
      <Route path="/" component={Projects} />
      <Route path="/statistics/:projectId?" component={Statistics} />
      <Route path="/:projectId" component={Tasks} />
    </Switch>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
