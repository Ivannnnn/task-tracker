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
      if (day) {
        const { projects, total } = mapData(
          await repository.getStatisticsOnDay(new Date(day))
        )
        updateProjects(projects)
        updateTotal(total)
      } else {
        updateProjects([])
      }
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
        <h3>{project.title}</h3>
        <table>
          <thead>
            <tr>
              <th>task</th>
              <th>time</th>
            </tr>
          </thead>
          <tbody>
            {project.tasks.map(renderTask)}
            <tr>
              <td></td>
              <td>{secsToTime(project.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  function renderTask(task) {
    return (
      <tr key={task.id}>
        <td>{task.title}</td>
        <td>{secsToTime(task.totalTime)}</td>
      </tr>
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
        <small className="total">{secsToTime(total)}</small>

        <div>{projects.map((project) => renderProject(project))}</div>
      </div>
    )
  )
}
