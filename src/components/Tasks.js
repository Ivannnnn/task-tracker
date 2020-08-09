import React, { memo, useEffect } from 'react'
import Estimate from 'components/Estimate'
import { useLocation } from 'wouter'
import Store from 'store'
import Input from 'components/Input'
import { classes, secsToTime } from 'utils'
import { useImmer, useInterval } from 'hooks'
import db from 'services/db'

const Task = ({
  title,
  time,
  estimate,
  active,
  UPDATE,
  REMOVE,
  ON_TOGGLE_ACTIVE,
}) => {
  return (
    <div className={classes('row', { active })}>
      <div>
        <button className="up">↑</button>
        <button className="down">↓</button>
      </div>
      <div>
        <Input value={title} onChange={(title) => UPDATE({ title })} />
      </div>
      <div>
        <Estimate
          value={estimate}
          onChange={(estimate) => UPDATE({ estimate })}
        />
      </div>
      <div>
        <button className="time" onClick={ON_TOGGLE_ACTIVE}>
          {secsToTime(time)}
        </button>
      </div>
      <div>
        <button onClick={REMOVE}>X</button>
      </div>
    </div>
  )
}

export default function Tasks({ params: { projectId } }) {
  const [tasks, updateTasks] = useImmer({})
  const [activeTask, updateActiveTask] = useImmer()
  const { projects } = Store.useContainer()
  const [_, setLocation] = useLocation()

  useInterval(() => {}, 1000, activeTask)

  const loadTasks = async () => {
    const tasks = await db.tasks.getBelongingTo(projectId)
    updateTasks(() => tasks)
  }

  useEffect(() => {
    projects[projectId] && loadTasks()
  }, [projectId])

  const updateActiveTaskTime = () => {
    updateTasks((tasks) => {
      tasks[activeTask].time++
      activeTask && db.tasks.updateTime(activeTask, tasks[activeTask].time)
    })
  }

  useInterval(updateActiveTaskTime, activeTask && 1000)

  const add = async () => {
    const newTask = { title: '', estimate: 0, time: 0 }
    const id = await db.tasks.add({ ...newTask, belongsTo: projectId })

    updateTasks((tasks) => {
      tasks[id] = newTask
    })
  }

  const UPDATE = (id) => async (props) => {
    await db.tasks.update(id, props)
    updateTasks((tasks) => {
      Object.assign(tasks[id], props)
    })
  }

  const REMOVE = (id) => async () => {
    await db.tasks.remove(id)
    updateTasks((tasks) => {
      delete tasks[id]
      if (activeTask === id) updateActiveTask(() => null)
    })
  }

  return (
    <div>
      <button onClick={() => setLocation('/')}>{'<<<<'}</button>

      <div className="list task-list">
        {Object.keys(tasks).map((id) => (
          <Task
            key={id}
            active={activeTask === id}
            {...tasks[id]}
            UPDATE={UPDATE(id)}
            REMOVE={REMOVE(id)}
            ON_TOGGLE_ACTIVE={() =>
              updateActiveTask((activeTask) => (activeTask === id ? null : id))
            }
          />
        ))}
      </div>
      <button onClick={add}>Add new</button>
    </div>
  )
}
