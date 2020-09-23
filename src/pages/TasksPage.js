import React, { useEffect, useRef } from 'react'
import Estimate from 'components/Estimate/Estimate'
import NotFound from 'components/NotFound'
import { classes, secsToTime, startOfDay } from 'utils'
import { useLocation } from 'wouter'
import { useInterval, useImmer, useOrderable } from 'hooks'
import repository from 'db/repository'
import Task from 'db/models/TaskModel'
import Icon from 'components/Icon'

export default function Container({ params: { projectId } }) {
  const [_, setLocation] = useLocation()
  const [project, updateProject] = useImmer({})
  const [tasks, tasksMethods] = useOrderable('order')
  const [activeTaskId, updateActiveTaskId] = useImmer(null)

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

  useInterval(updateActiveTaskTime, activeTaskId !== null && 1000)

  async function updateActiveTaskTime() {
    const index = tasks.findIndex((task) => task.id === activeTaskId)
    const time = tasks[index].time

    const [task, revert] = await tasksMethods.update(index, {
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
    if (item.id === activeTaskId) updateActiveTaskId(() => null)
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

  const activateTask = (id) => updateActiveTaskId(() => id)
  const deactivateTask = (id) =>
    updateActiveTaskId((currentlyActive) =>
      currentlyActive === id ? null : id
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
        activeTaskId,
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
  activeTaskId,
  activateTask,
  deactivateTask,
}) {
  const table = useRef()

  function focusRowAtIndex(index) {
    table.current.querySelector(`tr:nth-child(${index + 1}) textarea`).focus()
  }

  function handleCreate() {
    if (tasks.length === 0 || tasks[0].title) {
      createTask()
      setTimeout(() => focusRowAtIndex(0))
    }
  }

  const stop = (cb) => (e) => {
    e.stopPropagation()
    cb && cb(e)
  }

  function renderTaskList() {
    return (
      <React.Fragment>
        <div className="w-full overflow-auto shadow bg-white mb-6">
          <table className="h-px w-full" ref={table}>
            <tbody>{tasks.map(renderTaskItem)}</tbody>
          </table>
        </div>

        <h2 className="text-xl ml-3 mb-3">Total</h2>

        <div className="flex">
          <div className="bg-white shadow py-1 px-3 border-l-2 border-gray-300 flex">
            <Icon type="estimate" className="w-6 mr-2" />
            <span className="text-lg">02:30</span>
          </div>
          <div className="bg-white shadow py-1 px-3 flex">
            <Icon type="stopwatch" className="w-6 mr-2" />
            <span className="text-lg">02:30</span>
          </div>
        </div>
      </React.Fragment>
    )
  }

  function renderTaskItem({ id, title, time, estimate }, index) {
    const last = tasks.length - 1 === index
    const active = id === activeTaskId

    return (
      <tr
        key={id}
        className={classes(
          'cursor-pointer py-1 border-blue-100 ',
          active && 'bg-blue-600 bg-opacity-25 h-full',
          !last && 'border-b-2'
        )}
        onClick={() => focusRowAtIndex(index)}
      >
        <td className="flex flex-col h-full p-0" style={{ width: '18px' }}>
          <button
            className="bg-gray-200 text-md p-1 h-1/2"
            onClick={stop(() => moveTask('up', index))}
          >
            <Icon type="up" />
          </button>
          <button
            className="bg-gray-200 text-md p-1 h-1/2"
            onClick={stop(() => moveTask('down', index))}
          >
            <Icon type="down" />
          </button>
        </td>

        <td className="px-4 whitespace-no-wrap w-2/12">
          <div className="flex">
            <Icon type="estimate" className="w-4 mr-2" />

            <Estimate
              value={estimate}
              onChange={(estimate) => updateTask(index, { estimate })}
              className="w-10 bg-transparent"
              onClick={stop()}
            />
          </div>
          <div className="flex">
            <Icon type="stopwatch" className="w-4 mr-2" />
            <span className="font-semibold">{secsToTime(time.today)}</span>
          </div>
        </td>

        <td className="px-2 py-1 whitespace-no-wrap relative">
          <textarea
            className="resize-none px-2 py-1 mx-2 w-full bg-transparent text-sm outline-none cursor-pointer focus:cursor-text"
            rows="2"
            value={title}
            onChange={(e) => updateTask(index, { title: e.target.value })}
            spellCheck={false}
          />
        </td>

        <td className="w-8">
          <div className="flex items-center">
            <div
              onClick={stop(() => removeTask(index))}
              className="p-2 w-8 ml-auto rounded-full block hover:bg-gray-200"
            >
              <Icon type="remove" />
            </div>
            <div
              onClick={stop(() =>
                active ? deactivateTask(id) : activateTask(id)
              )}
              className="w-10 p-2 mr-2 rounded-full block hover:bg-gray-200"
            >
              <Icon type={active ? 'pause' : 'play'} />
            </div>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div
      className="container mx-auto pt-10"
      style={{ height: 'calc(100vh - 124px)' }}
    >
      <h1 className="text-xl mx-8 mb-4">Tasks</h1>
      <div className="max-w-lg pl-4 h-full flex flex-col">
        <div className="bg-white text-gray-700 font-bold px-5 py-2 shadow border-b border-gray-300 flex">
          <h2 className="flex-grow leading-5">{project.title}</h2>
          <button
            onClick={handleCreate}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-bold px-4 rounded inline-flex items-center"
          >
            Add
          </button>
        </div>

        {tasks.length ? renderTaskList() : <p>No tasks created yet.</p>}
      </div>
    </div>
  )
}
