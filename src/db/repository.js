import db from './db'
import { startOfDay, relate, pick } from 'utils'

export default {
  getStatisticsOnDay: () => {},
  getStatisticsOnProject: () => {},
  getAllProjects: () => db.projects.toArray(),
  addProject: (props) => {
    return db.projects.add(props)
  },
  updateProject({ id, ...props }) {
    return db.projects.where({ id }).modify(props)
  },
  removeProject({ id }) {
    return db.transaction('rw', db.projects, db.tasks, db.times, async () => {
      const taskIds = await db.tasks.where({ projectId: id }).primaryKeys()
      return Promise.all([
        db.projects.delete(id),
        db.tasks.whereIn({ id: taskIds }).delete(),
        db.times.whereIn({ taskId: taskIds }).delete(),
      ])
    })
  },

  async getTasksWithTimesBelongingToProject(projectId) {
    const projects = await db.projects.where({ id: projectId }).keyBy('id')
    const tasks = await db.tasks.where({ projectId }).keyBy('id')
    const times = await db.times
      .whereIn({ taskId: Object.keys(tasks) })
      .keyBy('id')

    relate({ projects, tasks, times }, [
      'projects.id -> tasks.projectId',
      'tasks.id -> times.taskId',
    ])

    return {
      ids: Object.keys(projects),
      entities: { projects, tasks, times },
    }
  },

  addTask(props) {
    return db.tasks.add(props)
  },

  updateTask({ id, ...props }) {
    return db.tasks
      .where({ id })
      .modify(pick(props, ['estimate', 'order', 'title', 'projectId']))
  },
  removeTask({ id }) {
    return db.transaction('rw', db.tasks, db.times, async () => {
      return Promise.all([
        db.tasks.delete(id),
        db.times.where({ taskId: id }).delete(),
      ])
    })
  },
  async updateTaskDailyTime({ id: taskId, time }) {
    const day = startOfDay(new Date()).getTime()
    const existing = await db.times.where({ taskId, day }).first()

    return existing
      ? await db.times.where({ day, taskId }).modify({ duration: time.today })
      : await db.times.put({ day, duration: time.today, taskId })
  },
}
