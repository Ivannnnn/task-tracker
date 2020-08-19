import db from './db'
import { uuid, startOfDay, forEach } from 'utils'

const taskRepository = {
  with: {
    totalTime: async (tasks) => {
      const times = await db.times
        .whereIn({ taskId: Object.keys(tasks) })
        .toArray()

      forEach(tasks, (task) => {
        task.totalTime = 0
      })

      times.forEach((time) => {
        tasks[time.taskId].totalTime += time.duration
      })
    },
  },

  get: async (prop = {}) => {
    const query = prop.where ? db.tasks.where(prop.where) : db.tasks
    const data = await query.keyBy('id')

    if (prop.with) {
      await taskRepository.with[prop.with](data)
    }

    return data
  },

  add: async ({ id = uuid(), title = '', estimate = 0, projectId, order }) => {
    await db.tasks.put({ id, title, estimate, projectId, order })
    return { id, title, estimate, projectId, order }
  },
  update: async (id, props) => await db.tasks.where({ id }).modify(props),
  remove: async (id) => {
    return await db.tasks.where({ id }).delete()
  },

  updateTime: async (taskId, duration) => {
    const day = startOfDay(new Date()).getTime()
    const existing = await db.times.where({ taskId, day }).first()

    return existing
      ? await db.times.where({ day, taskId }).modify({ duration })
      : await db.times.put({ day, duration, taskId })
  },

  getOnDay: async (day) => {
    day = startOfDay(day).getTime()

    // get times where day
    // get tasks in times
    //
  },
}

export default taskRepository
