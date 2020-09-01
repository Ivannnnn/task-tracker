import React, { useEffect } from 'react'
import Estimate from 'components/Estimate'
import Input from 'components/Input'
import { classes, secsToTime } from 'utils'
import { useLocation } from 'wouter'
import { useImmer, useOrderable } from 'hooks'
import repository from 'db/repository'
import Task from 'db/models/TaskModel'

export default function Container({ params: { projectId } }) {
  const [_, setLocation] = useLocation()
  const [project, updateProject] = useImmer({})
  const [tasks, tasksMethods] = useOrderable('order')

  function mapData({ ids, entities }) {
    const project = entities.projects[ids[0]]
    const tasks = project.tasks.map((id) => {
      const task = entities.tasks[id]
      task.totalTime = task.times.reduce((acc, timeId) => {
        return acc + entities.times[timeId].duration
      }, 0)
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
      updateProject(() => project)
    })()
  }, [])

  async function updateTask(index, props) {
    const [task, revert] = await tasksMethods.update(index, props)
    repository.updateTask(task).catch(revert)
  }

  async function moveTask(direction, index) {
    const [firstTask, secondTask, revert] = await tasksMethods.move(
      direction,
      index
    )
    Promise.all([
      repository.updateTask(firstTask),
      repository.updateTask(secondTask),
    ]).catch(revert)
  }

  async function removeTask(index) {
    const [item, revert] = await tasksMethods.remove(index)
    repository.removeTask(item).catch(revert)
  }

  async function createTask() {
    const newTask = new Task({ projectId })
    const [order, revert] = await tasksMethods.add(newTask)
    repository.addTask({ ...newTask, order }).catch(revert)
  }

  const redirect = (path) => setLocation(path)

  return (
    <Tasks
      {...{
        redirect,
        project,
        tasks,
        updateTask,
        moveTask,
        createTask,
        removeTask,
      }}
    />
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
}) {
  const [activeTask, updateActiveTask] = useImmer(null)

  function renderTask({ id, title, estimate, totalTime }, index) {
    const active = activeTask && activeTask.id === id

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
            onClick={() => updateActiveTask(active ? null : id)}
          >
            {secsToTime(totalTime)}
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
      <h3>{project.title}</h3>

      <div className="list task-list">{tasks.map(renderTask)}</div>
      <button onClick={createTask}>Add new</button>
    </div>
  )
}
