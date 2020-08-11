import { createContainer } from 'unstated-next'
import { useImmer } from 'hooks'
import { sortBy, arraySwap } from 'utils'
import db from 'services/db'

const useStore = () => {
  const [projects, updateProjects] = useImmer({ byId: {}, byOrder: [] })

  const actions = {}

  actions.loadProjects = async () => {
    const byId = await db.projects.all()

    updateProjects(() => ({
      byId,
      byOrder: sortBy(Object.values(byId), 'order').map((props) => props.id),
    }))
  }

  actions.createProject = async () => {
    const lastProject =
      projects.byId[projects.byOrder[projects.byOrder.length - 1]]

    const newProject = {
      title: '',
      order: lastProject ? lastProject.order + 1 : 0,
    }

    const id = await db.projects.add(newProject)
    updateProjects((projects) => {
      projects.byId[id] = newProject
      projects.byOrder.push(id)
    })
  }

  actions.updateProject = async (id, { title }) => {
    await db.projects.update(id, { title })
    updateProjects((projects) => {
      Object.assign(projects.byId[id], { title })
    })
  }

  actions.removeProject = async (index) => {
    const id = projects.byOrder[index]
    await db.projects.remove(id)
    updateProjects((projects) => {
      delete projects[id]
      projects.byOrder.splice(index, 1)
    })
  }

  actions.moveUp = async (index) => {
    const id = projects.byOrder[index]
    const prevId = projects.byOrder[index - 1]

    await Promise.all([
      db.projects.update(id, { order: index - 1 }),
      db.projects.update(prevId, { order: index }),
    ])

    updateProjects((projects) => {
      arraySwap(projects.byOrder, index, index - 1)
    })
  }

  actions.moveDown = async (index) => {
    const id = projects.byOrder[index]
    const nextId = projects.byOrder[index + 1]

    await Promise.all([
      db.projects.update(id, { order: index + 1 }),
      db.projects.update(nextId, { order: index }),
    ])

    updateProjects((projects) => {
      arraySwap(projects.byOrder, index, index + 1)
    })
  }

  return {
    projects,
    actions,
    get projectsLoaded() {
      return !!projects
    },
  }
}

export default createContainer(useStore)
