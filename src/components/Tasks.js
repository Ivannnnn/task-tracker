import React, { memo, useEffect } from 'react'
import Estimate from 'components/Estimate'
import { useLocation } from 'wouter'
import Store from 'store'
import Input from 'components/Input'
import { classes, secsToTime, sortBy, arraySwap } from 'utils'
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
  ON_UP,
  ON_DOWN,
}) => {
  return (
    <div className={classes('row', { active })}>
      <div>
        <button onClick={ON_UP} className="up">
          ↑
        </button>
        <button onClick={ON_DOWN} className="down">
          ↓
        </button>
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
  const [tasks, updateTasks] = useImmer({
    byId: {},
    ordered: [],
    activeId: null,
  })
  const { projects } = Store.useContainer()
  const [_, setLocation] = useLocation()

  const loadTasks = async () => {
    const byId = await db.tasks.getBelongingTo(projectId)

    updateTasks((tasks) => {
      tasks.byId = byId
      tasks.ordered = sortBy(Object.values(byId), 'order').map(
        (props) => props.id
      )
    })
  }

  useEffect(() => {
    projects.byId[projectId] && loadTasks()
  }, [projects.byId[projectId]])

  const updateActiveTaskTime = () => {
    updateTasks((tasks) => {
      tasks.byId[tasks.activeId].time++
      tasks.activeId &&
        db.tasks.updateTime(tasks.activeId, tasks.byId[tasks.activeId].time)
    })
  }

  useInterval(updateActiveTaskTime, tasks.activeId && 1000)

  const add = async () => {
    const newTask = {
      title: '',
      estimate: 0,
      time: 0,
      belongsTo: projectId,
      order: tasks.ordered.length,
    }

    const id = await db.tasks.add(newTask)

    updateTasks(({ byId, ordered }) => {
      byId[id] = newTask
      ordered.push(id)
    })
  }

  const UPDATE = (id) => async (props) => {
    await db.tasks.update(id, props)
    updateTasks(({ byId }) => {
      Object.assign(byId[id], props)
    })
  }

  const REMOVE = (index) => async () => {
    const id = tasks.ordered[index]
    await db.tasks.remove(id)
    updateTasks((tasks) => {
      delete tasks.byId[id]
      tasks.ordered.splice(index, 1)
      if (tasks.activeId === id)
        updateTasks(({ activeId }) => (activeId = null))
    })
  }

  const MOVE_UP = async (index) => {
    const id = tasks.ordered[index]
    const prevId = tasks.ordered[index - 1]

    await Promise.all([
      db.tasks.update(id, { order: index - 1 }),
      db.tasks.update(prevId, { order: index }),
    ])

    updateTasks((tasks) => {
      arraySwap(tasks.ordered, index, index - 1)
    })
  }

  const MOVE_DOWN = async (index) => {
    const id = tasks.ordered[index]
    const nextId = tasks.ordered[index + 1]

    await Promise.all([
      db.tasks.update(id, { order: index + 1 }),
      db.tasks.update(nextId, { order: index }),
    ])

    updateTasks((tasks) => {
      arraySwap(tasks.ordered, index, index + 1)
    })
  }

  return (
    <div>
      <button onClick={() => setLocation('/')}>{'<<<<'}</button>

      <div className="list task-list">
        {tasks.ordered.map((id, index) => (
          <Task
            key={id}
            active={tasks.activeId === id}
            UPDATE={UPDATE(id)}
            REMOVE={REMOVE(index)}
            ON_TOGGLE_ACTIVE={() =>
              updateTasks((tasks) => {
                tasks.activeId = tasks.activeId === id ? null : id
              })
            }
            ON_UP={() => index > 0 && MOVE_UP(index)}
            ON_DOWN={() => index < tasks.ordered.length - 1 && MOVE_DOWN(index)}
            {...tasks.byId[id]}
          />
        ))}
      </div>
      <button onClick={add}>Add new</button>
    </div>
  )
}
