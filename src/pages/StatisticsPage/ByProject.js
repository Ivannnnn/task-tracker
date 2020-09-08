import React, { useEffect } from 'react'
import { useImmer } from 'hooks'
import { groupBy, yyyymmdd, secsToTime, sortByKey } from 'utils'
import repository from 'db/repository'
import NotFound from 'components/NotFound'

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

function ByProject({ project, taskTimesByDay }) {
  function renderTasks(tasks) {
    return tasks.map((task) => {
      return (
        <tr key={task.id}>
          <td>{task.title}</td>
          <td>{secsToTime(task.duration)}</td>
        </tr>
      )
    })
  }

  return (
    <div>
      <h3>
        Statistics for "{project.title}"
        <small className="total">{secsToTime(project.total)}</small>
      </h3>

      {Object.keys(taskTimesByDay).map((day) => {
        return (
          <div key={day}>
            <h4>{yyyymmdd(new Date(Number(day)))} </h4>

            <table>
              <thead>
                <tr>
                  <th>task</th>
                  <th>time</th>
                </tr>
              </thead>
              <tbody>
                {renderTasks(taskTimesByDay[day].tasks)}
                <tr>
                  <td></td>
                  <td>{secsToTime(taskTimesByDay[day].total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}
