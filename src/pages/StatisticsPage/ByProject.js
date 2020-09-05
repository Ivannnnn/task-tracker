import React, { useEffect } from 'react'
import { useImmer } from 'hooks'
import { groupBy, yyyymmdd } from 'utils'
import repository from 'db/repository'
import NotFound from 'components/NotFound'

export default function Container({ id }) {
  const [{ project, taskTimesByDay }, updateState] = useImmer({
    project: null,
    taskTimesByDay: {},
  })

  function mapData({ ids, entities }) {
    const project = entities.projects[ids[0]]

    const taskTimesByDay = groupBy(Object.values(entities.times), 'day')

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

  return (
    <div>
      <h3>{project.title}</h3>

      {Object.keys(taskTimesByDay).map((day) => {
        return (
          <div key={day}>
            <h4>{yyyymmdd(new Date(Number(day)))}</h4>
            <h5>Total: {taskTimesByDay[day].total}</h5>
            {renderTasks(taskTimesByDay[day].tasks)}
          </div>
        )
      })}
    </div>
  )
}
