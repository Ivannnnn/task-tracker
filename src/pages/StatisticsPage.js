import React, { useState, useEffect } from 'react'
import { useImmer } from 'hooks'
import { groupBy } from 'utils'
import repository from 'db/repository'
import NotFound from 'components/NotFound'

const yyyymmdd = (d) =>
  `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${(
    '0' + d.getDate()
  ).slice(-2)}`

function ByDay() {
  const [day, setDay] = useState(yyyymmdd(new Date()))
  const [projects, updateProjects] = useImmer([])

  function mapData({ ids, entities }) {
    return ids.map((projectId) => {
      return {
        ...entities.projects[projectId],
        tasks: entities.projects[projectId].tasks.map((taskId) => {
          return {
            ...entities.tasks[taskId],
            totalTime: entities.tasks[taskId].times.reduce((acc, timeId) => {
              return acc + entities.times[timeId].duration
            }, 0),
          }
        }),
      }
    })
  }

  useEffect(() => {
    ;(async function () {
      updateProjects(
        mapData(await repository.getStatisticsOnDay(new Date(day)))
      )
    })()
  }, [day])

  function renderProject(project) {
    return (
      <div key={project.id}>
        <h4>{project.title}</h4>
        <ul>{project.tasks.map(renderTask)}</ul>
      </div>
    )
  }

  function renderTask(task) {
    return (
      <li key={task.id}>
        {task.title}: {task.totalTime}
      </li>
    )
  }

  return (
    projects && (
      <div>
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />

        <div>{projects.map((project) => renderProject(project))}</div>
      </div>
    )
  )
}

function ByProject({ id }) {
  const [{ project, taskTimesByDay }, updateState] = useImmer({
    project: null,
    taskTimesByDay: {},
  })

  function mapData({ ids, entities }) {
    const project = entities.projects[ids[0]]

    const taskTimesByDay = groupBy(Object.values(entities.times), 'day')

    for (let day in taskTimesByDay) {
      taskTimesByDay[day] = taskTimesByDay[day].map(({ duration, taskId }) => ({
        id: taskId,
        title: entities.tasks[taskId].title,
        duration,
      }))
    }

    return {
      project,
      taskTimesByDay,
    }
  }

  useEffect(() => {
    ;(async function () {
      updateState(mapData(await repository.getStatisticsBelongingToProject(id)))
    })()
  }, [])

  function renderTasks(tasks) {
    return (
      <ul>
        {tasks.map((task) => {
          return (
            <li key={task.id}>
              {task.title}: {task.duration}
            </li>
          )
        })}
      </ul>
    )
  }

  return project ? (
    <div>
      <h3>{project.title}</h3>

      {Object.keys(taskTimesByDay).map((day) => {
        const total = taskTimesByDay[day].reduce(
          (acc, time) => acc + time.duration,
          0
        )
        return (
          <div key={day}>
            <h4>{yyyymmdd(new Date(Number(day)))}</h4>
            <h5>Total: {total}</h5>
            {renderTasks(taskTimesByDay[day])}
          </div>
        )
      })}
    </div>
  ) : (
    <NotFound />
  )
}

export default function Statistics({ params: { projectId } }) {
  return projectId ? <ByProject id={projectId} /> : <ByDay />
}
