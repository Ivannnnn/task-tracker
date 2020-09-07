import React, { useEffect } from 'react'
import Estimate from 'components/Estimate'
import Input from 'components/Input'
import NotFound from 'components/NotFound'
import { classes, secsToTime, startOfDay } from 'utils'
import { useLocation } from 'wouter'
import { useInterval, useImmer, useOrderable } from 'hooks'
import repository from 'db/repository'
import Task from 'db/models/TaskModel'

export default function Container({ params: { projectId } }) {
  const [_, setLocation] = useLocation()
  const [project, updateProject] = useImmer({})
  const [tasks, tasksMethods] = useOrderable('order')
  const [activeTaskIndex, updateActiveTaskIndex] = useImmer(null)

  function mapData({ ids, entities }) {
    const isToday = (time) => time.day === startOfDay(new Date()).getTime()
    const project = entities.projects[ids[0]]

    if (!project) return { project: null, tasks: [] }

    const tasks = project.tasks.map((id) => {
      const task = entities.tasks[id]
      task.time = task.times.reduce(
        ({ total, today }, timeId) => {
          const time = entities.times[timeId]
          if (isToday(time)) {
            return {
              total: total + time.duration,
              today: today + time.duration,
            }
          } else {
            return { total: total + time.duration, today }
          }
        },
        { total: 0, today: 0 }
      )

      delete task.times
      return task
    })

    return { project, tasks }
  }

  useEffect(() => {
    ;(async function () {
      const { project, tasks } = mapData(
        await repository.getTasksWithTimesBelongingToProject(projectId)
      )
      tasksMethods.set(tasks)
      updateProject(project)
    })()
  }, [])

  useInterval(updateActiveTaskTime, activeTaskIndex !== null && 1000)

  async function updateActiveTaskTime() {
    const time = tasks[activeTaskIndex].time
    const [task, revert] = await tasksMethods.update(activeTaskIndex, {
      time: {
        today: time.today + 1,
        total: time.total + 1,
      },
    })

    return repository.updateTaskDailyTime(task).catch(revert)
  }

  async function updateTask(index, props) {
    const [task, revert] = await tasksMethods.update(index, props)
    return repository.updateTask(task).catch(revert)
  }

  async function moveTask(direction, index) {
    const [firstTask, secondTask, revert] = await tasksMethods.move(
      direction,
      index
    )
    return Promise.all([
      repository.updateTask(firstTask),
      repository.updateTask(secondTask),
    ]).catch(revert)
  }

  async function removeTask(index) {
    const [item, revert] = await tasksMethods.remove(index)
    if (index === activeTaskIndex) updateActiveTaskIndex(() => null)
    return repository.removeTask(item).catch(revert)
  }

  async function createTask() {
    const newTask = new Task({ projectId })
    const [order, revert] = await tasksMethods.add({
      ...newTask,
      time: { total: 0, today: 0 },
    })
    return repository.addTask({ ...newTask, order }).catch(revert)
  }

  const redirect = (path) => setLocation(path)

  const activateTask = (index) => updateActiveTaskIndex(() => index)
  const deactivateTask = (index) =>
    updateActiveTaskIndex((currentlyActive) =>
      currentlyActive === index ? null : index
    )

  return project ? (
    <Tasks
      {...{
        redirect,
        project,
        tasks,
        updateTask,
        moveTask,
        createTask,
        removeTask,
        activeTaskIndex,
        activateTask,
        deactivateTask,
      }}
    />
  ) : (
    <NotFound />
  )
}

function Tasks({
  redirect,
  project,
  tasks,
  updateTask,
  moveTask,
  createTask,
  removeTask,
  activeTaskIndex,
  activateTask,
  deactivateTask,
}) {
  function renderTask(task, index) {
    const { id, title, estimate, time } = task
    const active = activeTaskIndex === index

    return (
      <div key={id} className={classes('row', { active })}>
        <div>
          <button onClick={() => moveTask('up', index)} className="up">
            ↑
          </button>
          <button onClick={() => moveTask('down', index)} className="down">
            ↓
          </button>
        </div>
        <div>
          <Input
            value={title}
            onChange={(title) => updateTask(index, { title })}
          />
        </div>
        <div>
          <Estimate
            value={estimate}
            onChange={(estimate) => updateTask(index, { estimate })}
          />
        </div>
        <div>
          <button
            className="time"
            onClick={() =>
              active ? deactivateTask(index) : activateTask(index)
            }
          >
            {secsToTime(time.total)}
          </button>
        </div>
        <div>
          <button onClick={() => removeTask(index)}>X</button>
        </div>
      </div>
    )
  }
  return (
    <div>
      <button onClick={() => redirect('/')}>{'<<<<'}</button>
      <button onClick={() => redirect(`statistics/${project.id}`)}>
        stats
      </button>
      <br />
      <br />
      <button onClick={createTask}>Add new</button>
      <h3>{project.title}</h3>

      <div className="list task-list">{tasks.map(renderTask)}</div>
    </div>
  )
}
