import db from './db'
import { uuid, forEach } from 'utils'

const projectRepository = {
  with: {
    tasks: async (projects) => {
      const tasks = await db.tasks
        .whereIn({ projectId: Object.keys(projects) })
        .keyBy('id')

      forEach(projects, (project) => {
        project.tasks = {}
      })

      forEach(tasks, (task) => {
        projects[task.projectId].tasks[task.id] = task
      })
    },
  },

  get: async (prop = {}) => {
    const query = prop.where ? db.projects.where(prop.where) : db.projects
    const data = await query.keyBy('id')

    if (prop.with) {
      await projectRepository.with[prop.with](data)
    }

    return data
  },

  all: async () => await db.projects.keyBy('id'),
  add: async ({ id = uuid(), title = '', order }) => {
    await db.projects.put({ id, title, order })
    return { id, title, order }
  },
  update: async (id, props) => db.projects.where({ id }).modify(props),
  remove: async (id) => {
    return await db.projects.where({ id }).delete()
  },
}

export default projectRepository
