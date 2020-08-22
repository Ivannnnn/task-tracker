import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import './styles.css'
import Store from 'store'
import Projects from 'components/Projects'
import Tasks from 'components/Tasks'
import Statistics from 'components/Statistics'
import { Switch, Route } from 'wouter'

import repository from 'db/repository'

function App() {
  const { projectsLoaded, actions } = Store.useContainer()

  useEffect(() => {
    actions.loadProjects()
  }, [])

  return projectsLoaded ? (
    <Switch>
      <Route path="/" component={Projects} />
      <Route path="/statistics/:projectId?" component={Statistics} />
      <Route path="/:projectId" component={Tasks} />
    </Switch>
  ) : null
}

ReactDOM.render(
  <Store.Provider>
    <App />
  </Store.Provider>,
  document.getElementById('root')
)

repository.test()
