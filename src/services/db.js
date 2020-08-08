import Dexie from 'dexie'
import { uuid, keyBy } from 'utils'

const db = new Dexie('db')

db.version(1).stores({
  projects: 'id, title',
  projectTasks: 'id, belongsTo', // title, estimate
  taskTimes: 'id, day, belongsTo', // day, duration
})

const tasks = {
  getBelongingTo: async (projectId) => {
    return keyBy(
      await db.projectTasks.where('belongsTo').equals(projectId).toArray(),
      'id'
    )
  },
  add: async ({ id = uuid(), title = '', estimate = 0, belongsTo }) => {
    return await db.projectTasks.put({ id, title, estimate, belongsTo })
  },
  update: async (id, props) => db.projectTasks.where({ id }).modify(props),
  remove: async (id) => db.projectTasks.where({ id }).delete(),
}

const projects = {
  all: async () => keyBy(await db.projects.toArray(), 'id'),
  add: async ({ id = uuid(), title = '' }) => db.projects.put({ id, title }),
  update: async (id, props) => db.projects.where({ id }).modify(props),
  remove: async (id) => {
    db.projects.where({ id }).delete()
    db.projectTasks.where({ belongsTo: id }).delete()
  },
}

export default { tasks, projects }
