import React, { useEffect, useState } from 'react'
import { useImmer } from 'hooks'
import repository from 'db/repository'
import { yyyymmdd, secsToTime, classes } from 'utils'
import Icon from 'components/Icon'

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

function Project({ title, total, tasks }) {
  const [expanded, setExpanded] = useState(false)

  function renderTask({ id, title, totalTime }) {
    return (
      <tr key={id} className={classes('border-b border-gray-200')}>
        <td className="w-full">{title}</td>
        <td>{secsToTime(totalTime)}</td>
      </tr>
    )
  }
  return (
    <div
      className={classes(
        'p-3 overflow-hidden shadow bg-white mb-3 cursor-pointer'
      )}
      style={{ height: expanded ? 'auto' : '44px' }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between">
        <div className="font-semibold">
          {title}
          <span className="text-sm text-gray-600 rounded-sm px-1 ml-2">
            {secsToTime(total)}
          </span>
        </div>
        <button>
          <Icon type={expanded ? 'up' : 'down'} className="w-4" />
        </button>
      </div>

      <table className="mt-2">
        <tbody>{tasks.map(renderTask)}</tbody>
      </table>
    </div>
  )
}

function ByDay({ day, projects, total, onDayChange }) {
  return (
    <div
      className="container mx-auto pt-10 max-w-sm "
      style={{ height: 'calc(100vh - 124px)' }}
    >
      <div>
        <input
          type="date"
          className="w-full px-3 py-1 mb-8"
          value={day}
          onChange={(e) => onDayChange(e.target.value)}
        />
      </div>

      {projects.map((props) => (
        <Project key={props.id} {...props} />
      ))}

      <h2 className="text-xl ml-2">Total: {secsToTime(total)}</h2>
    </div>
  )
}
