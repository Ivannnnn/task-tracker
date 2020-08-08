import React, { memo, useEffect, useState } from 'react'
import Estimate from 'components/Estimate'
import { secsToTime } from 'utils'
import { useLocation } from 'wouter'
import Store from 'store'
import Input from 'components/Input'
import { useImmer } from 'hooks'
import { proxyStorage, uuid } from 'utils'

const createTask = () => [uuid(), { title: '', time: 0, estimate: 0 }]

export default function Tasks({ params: { projectId } }) {
  const [tasks, updateTasks] = useImmer({})
  const { projects, actions } = Store.useContainer()
  const [_, setLocation] = useLocation()

  const loadTasks = () => {
    const tasks = {}
    projects[projectId].taskIds.forEach((taskId) => {
      tasks[taskId] = proxyStorage[taskId]
    })

    updateTasks(() => tasks)
  }

  useEffect(() => projects[projectId] && loadTasks(), [projectId])

  const add = () => {
    const [newId, newTask] = createTask()

    updateTasks((tasks) => {
      tasks[newId] = newTask
      actions.updateProjectTasks(projectId, Object.keys(tasks))
      proxyStorage[newId] = newTask
    })
  }

  const update = (id, props) => {
    updateTasks((tasks) => {
      Object.assign(tasks[id], props)
      proxyStorage[id] = tasks[id]
    })
  }

  const remove = (id) => {
    updateTasks((tasks) => {
      delete tasks[id]
      delete proxyStorage[id]
      actions.updateProjectTasks(projectId, Object.keys(tasks))
    })
  }

  return (
    <div>
      <button onClick={() => setLocation('/')}>{'<<<<'}</button>

      <div className="list task-list">
        {Object.keys(tasks).map((id, i) => {
          const { time, estimate, title } = tasks[id]

          return (
            <div key={id} className="row">
              <div>
                <button className="up">↑</button>
                <button className="down">↓</button>
              </div>
              <div>
                <Input
                  value={title}
                  onChange={(title) => update(id, { title })}
                />
              </div>
              <div>
                <Estimate
                  value={estimate}
                  onChange={(estimate) => update(id, { estimate })}
                />
              </div>
              <div>{secsToTime(time)}</div>
              <div>
                <button onClick={() => remove(id)}>X</button>
              </div>
            </div>
          )
        })}
      </div>
      <button onClick={add}>Add new</button>
    </div>
  )
}
