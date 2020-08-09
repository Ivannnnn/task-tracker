import Dexie from 'dexie'
import { uuid, keyBy, startOfDay } from 'utils'

const db = new Dexie('db')

db.version(1).stores({
  projects: 'id, title',
  projectTasks: 'id, belongsTo', // title, estimate
  taskTimes: 'id, day, belongsTo', // duration
})

//taskTimes don't need id, just make them autoincrement

const tasksTransformer = (tasks) => {
  const defaults = { title: '', time: 0, estimate: 0 }
  tasks = tasks.map((task) => ({ ...defaults, ...task }))
  return keyBy(tasks, 'id')
}

const tasks = {
  getBelongingTo: async (projectId) => {
    const tasks = tasksTransformer(
      await db.projectTasks.where('belongsTo').equals(projectId).toArray()
    )

    const times = await db.taskTimes
      .where('belongsTo')
      .anyOf(Object.keys(tasks))
      .toArray()

    times.forEach(({ duration, belongsTo: taskId }) => {
      tasks[taskId].time += duration
    })

    return tasks
  },
  add: async ({
    id = uuid(),
    title = '',
    estimate = 0,
    belongsTo,
    time = 0,
  }) => {
    return await db.projectTasks.put({
      id,
      title,
      estimate,
      time,
      belongsTo,
    })
  },
  update: async (id, props) => db.projectTasks.where({ id }).modify(props),
  remove: async (id) => {
    return Promise.all([
      db.projectTasks.where({ id }).delete(),
      db.taskTimes.where({ belongsTo: id }).delete(),
    ])
  },

  updateTime: async (belongsTo, duration) => {
    const day = startOfDay(new Date()).getTime()
    const existing = await db.taskTimes.where({ belongsTo, day }).first()

    return existing
      ? await db.taskTimes.where({ day, belongsTo }).modify({ duration })
      : await db.taskTimes.put({ id: uuid(), day, duration, belongsTo })
  },
}

const projects = {
  all: async () => keyBy(await db.projects.toArray(), 'id'),
  add: async ({ id = uuid(), title = '' }) => db.projects.put({ id, title }),
  update: async (id, props) => db.projects.where({ id }).modify(props),
  remove: async (id) => {
    db.projects.where({ id }).delete()
    const belongingTasks = db.projectTasks.where({ belongsTo: id })
    db.taskTimes
      .where('belongsTo')
      .anyOf(await belongingTasks.primaryKeys())
      .delete()
    await belongingTasks.delete()
  },
}

export default { tasks, projects }