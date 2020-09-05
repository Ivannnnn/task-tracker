import React, { useEffect, useState } from 'react'
import { useImmer } from 'hooks'
import repository from 'db/repository'
import { yyyymmdd } from 'utils'

export default function Container() {
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

  return <ByDay day={day} projects={projects} onDayChange={setDay} />
}

function ByDay({ day, projects, onDayChange }) {
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
          onChange={(e) => onDayChange(e.target.value)}
        />

        <div>{projects.map((project) => renderProject(project))}</div>
      </div>
    )
  )
}
