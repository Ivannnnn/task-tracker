import React, { useEffect, useState } from 'react'
import { useImmer } from 'hooks'
import { groupBy, yyyymmdd, secsToTime, sortByKey, classes } from 'utils'
import repository from 'db/repository'
import NotFound from 'components/NotFound'
import Icon from 'components/Icon'

export default function Container({ id }) {
  const [{ project, taskTimesByDay }, updateState] = useImmer({
    project: null,
    taskTimesByDay: {},
  })

  function mapData({ ids, entities }) {
    const project = entities.projects[ids[0]]

    const taskTimesByDay = sortByKey(
      groupBy(Object.values(entities.times), 'day'),
      'desc'
    )

    for (let day in taskTimesByDay) {
      taskTimesByDay[day] = {
        tasks: taskTimesByDay[day].map(({ duration, taskId }) => ({
          id: taskId,
          title: entities.tasks[taskId].title,
          duration,
        })),
        total: taskTimesByDay[day].reduce(
          (acc, time) => acc + time.duration,
          0
        ),
      }
    }

    project.total = Object.values(taskTimesByDay).reduce(
      (acc, { total }) => acc + total,
      0
    )

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

  return project ? (
    <ByProject project={project} taskTimesByDay={taskTimesByDay} />
  ) : (
    <NotFound />
  )
}

function Day({ day, tasks, total }) {
  const [expanded, setExpanded] = useState(false)

  function renderTask({ title, duration }, i) {
    return (
      <tr key={i} className={classes('border-b border-gray-200')}>
        <td className="w-full">{title}</td>
        <td>{secsToTime(duration)}</td>
      </tr>
    )
  }

  return (
    <div
      className={classes(
        'max-w-sm p-3 overflow-hidden shadow bg-white mb-6 cursor-pointer'
      )}
      style={{ height: expanded ? 'auto' : '44px' }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between">
        <div className="font-semibold">
          {yyyymmdd(new Date(Number(day)))}
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

function ByProject({ project, taskTimesByDay }) {
  return (
    <div
      className="container mx-auto pt-10"
      style={{ height: 'calc(100vh - 124px)' }}
    >
      <h1 className="text-xl ml-2 mb-4">Project: "{project.title}"</h1>

      {Object.keys(taskTimesByDay).map((day) => (
        <Day day={day} key={day} {...taskTimesByDay[day]} />
      ))}
    </div>
  )
}
