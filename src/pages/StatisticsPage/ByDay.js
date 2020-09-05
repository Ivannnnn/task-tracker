import React, { useEffect, useState } from 'react'
import { useImmer } from 'hooks'
import repository from 'db/repository'
import { yyyymmdd, secsToTime } from 'utils'

export default function Container() {
  const [day, setDay] = useState(yyyymmdd(new Date()))
  const [projects, updateProjects] = useImmer([])
  const [total, updateTotal] = useImmer()

  function mapData({ ids, entities }) {
    const projects = ids.map((projectId) => {
      const tasks = entities.projects[projectId].tasks.map((taskId) => {
        return {
          ...entities.tasks[taskId],
          totalTime: entities.tasks[taskId].times.reduce((acc, timeId) => {
            return acc + entities.times[timeId].duration
          }, 0),
        }
      })

      const total = tasks.reduce((acc, task) => acc + task.totalTime, 0)

      return {
        ...entities.projects[projectId],
        tasks,
        total,
      }
    })

    const total = projects.reduce((acc, project) => acc + project.total, 0)

    return {
      projects,
      total,
    }
  }

  useEffect(() => {
    ;(async function () {
      const { projects, total } = mapData(
        await repository.getStatisticsOnDay(new Date(day))
      )
      updateProjects(projects)
      updateTotal(total)
    })()
  }, [day])

  return (
    <ByDay day={day} projects={projects} onDayChange={setDay} total={total} />
  )
}

function ByDay({ day, projects, total, onDayChange }) {
  function renderProject(project) {
    return (
      <div key={project.id}>
        <h3>
          {project.title} - <small>{secsToTime(project.total)}</small>
        </h3>
        <ul>{project.tasks.map(renderTask)}</ul>
      </div>
    )
  }

  function renderTask(task) {
    return (
      <li key={task.id}>
        {task.title}: {secsToTime(task.totalTime)}
      </li>
    )
  }

  return (
    projects && (
      <div>
        <h3>Statistics for:</h3>
        <input
          type="date"
          value={day}
          onChange={(e) => onDayChange(e.target.value)}
        />

        <h4>Total: {secsToTime(total)}</h4>
        <div>{projects.map((project) => renderProject(project))}</div>
      </div>
    )
  )
}
