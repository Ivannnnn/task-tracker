import React, { useState, useEffect } from 'react'
import { useImmer } from 'hooks'
import { startOfDay } from 'utils'
import repository from 'db/repository'

const yyyymmdd = (d) =>
  `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${(
    '0' + d.getDate()
  ).slice(-2)}`

function ByDay() {
  const [day, setDay] = useState(startOfDay(new Date()))
  const [data, updateData] = useImmer({
    tasks: {},
    projects: {},
  })

  useEffect(() => {
    /*
      db.tasks.getTasksOnDay(day).then((data) => {
        updateData(() => data)
      })
    */
  }, [day])

  return (
    <div>
      <input
        type="date"
        value={yyyymmdd(day)}
        onChange={(e) => setDay(new Date(e.target.value))}
      />

      <div>
        {Object.keys(data.projects).map((projectId) => {
          return (
            <div key={projectId}>
              <h3>{data.projects[projectId].title}</h3>
              <ul>
                {data.projects[projectId].tasks.map((taskId) => {
                  return (
                    <li key={taskId}>
                      {data.tasks[taskId].title}: {data.tasks[taskId].duration}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ByProject({ id }) {
  useEffect(() => {
    /*
      db.projects.getTimesByDay(id).then((times) => {
        console.log(times)

        // group by month and display
      })
    */
  }, [])

  return null
}

export default function Statistics({ params: { projectId } }) {
  return projectId ? <ByProject id={projectId} /> : <ByDay />
}
