import React, { memo, useState } from 'react'
import { useLocation } from 'wouter'
import Store from 'store'
import Input from 'components/Input'

export default function Projects() {
  const { projects, actions } = Store.useContainer()
  const [location, setLocation] = useLocation()

  const onAddNew = () => {
    const lastProject = projects[Object.keys(projects).pop()]
    if (!lastProject || lastProject.title.length) actions.addProject('')
  }

  const attemptDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      actions.removeProject(id)
    }
  }

  return (
    <div>
      <div className="list project-list">
        {Object.keys(projects).map((id) => {
          return (
            <div key={id} className="row">
              <div>
                <Input
                  value={projects[id].title}
                  onChange={(title) => actions.updateProject(id, { title })}
                />
              </div>
              <div>
                <button onClick={() => setLocation('/' + id)}>>></button>
              </div>
              <div>
                <button onClick={() => attemptDelete(id)}>X</button>
              </div>
            </div>
          )
        })}
      </div>
      <button onClick={onAddNew}>Add</button>
    </div>
  )
}
