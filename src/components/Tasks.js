import React, { memo, useEffect } from 'react'
import Estimate from 'components/Estimate'
import { secsToTime } from 'utils'
import { useLocation } from 'wouter'
import Store from 'store'
import Input from 'components/Input'
import { useImmer } from 'hooks'
import db from 'services/db'

export default function Tasks({ params: { projectId } }) {
  const [tasks, updateTasks] = useImmer({})
  const { projects } = Store.useContainer()
  const [_, setLocation] = useLocation()

  const loadTasks = async () => {
    const tasks = await db.tasks.getBelongingTo(projectId)
    updateTasks(() => tasks)
  }

  useEffect(() => {
    projects[projectId] && loadTasks()
  }, [projectId])

  const add = async () => {
    const newTask = { title: '', estimate: 0 }
    const id = await db.tasks.add({ ...newTask, belongsTo: projectId })

    updateTasks((tasks) => {
      tasks[id] = newTask
    })
  }

  const update = async (id, props) => {
    await db.tasks.update(id, props)
    updateTasks((tasks) => {
      Object.assign(tasks[id], props)
    })
  }

  const remove = async (id) => {
    await db.tasks.remove(id)
    updateTasks((tasks) => {
      delete tasks[id]
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
