import React, { memo } from 'react'
import { useLocation } from 'wouter'
import Store from 'store'
import Input from 'components/Input'

export default function Projects() {
  const { projects, actions } = Store.useContainer()
  const [location, setLocation] = useLocation()

  const onAddNew = () => {
    const lastProject =
      projects.byId[projects.byOrder[projects.byOrder.length - 1]]
    ;(!lastProject || (lastProject || {}).title) && actions.createProject()
  }

  const attemptDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      actions.removeProject(id)
    }
  }

  return (
    <div>
      <div className="list project-list">
        {projects.byOrder.map((id, index) => {
          return (
            <div key={id} className="row">
              <div>
                <button
                  onClick={() => index > 0 && actions.moveUp(index)}
                  className="up"
                >
                  ↑
                </button>
                <button
                  onClick={() =>
                    index < projects.byOrder.length - 1 &&
                    actions.moveDown(index)
                  }
                  className="down"
                >
                  ↓
                </button>
              </div>
              <div>
                <Input
                  value={projects.byId[id].title}
                  onChange={(title) => actions.updateProject(id, { title })}
                />
              </div>
              <div>
                <button onClick={() => setLocation('/' + id)}>>></button>
              </div>
              <div>
                <button onClick={() => attemptDelete(index)}>X</button>
              </div>
            </div>
          )
        })}
      </div>
      <button onClick={onAddNew}>Add</button>
    </div>
  )
}
