import { createContainer } from 'unstated-next'
import { useImmer } from 'hooks'
import { sortBy, arraySwap } from 'utils'
import projectRepository from 'db/projectRepository'

const useStore = () => {
  const [projects, updateProjects] = useImmer({ byId: {}, byOrder: [] })

  const actions = {}

  actions.loadProjects = async () => {
    const byId = await projectRepository.all()

    updateProjects(() => ({
      byId,
      byOrder: sortBy(Object.values(byId), 'order').map((props) => props.id),
    }))
  }

  actions.createProject = async () => {
    const lastProject =
      projects.byId[projects.byOrder[projects.byOrder.length - 1]]

    const newProject = await projectRepository.add({
      order: lastProject ? lastProject.order + 1 : 0,
    })

    updateProjects((projects) => {
      projects.byId[newProject.id] = newProject
      projects.byOrder.push(newProject.id)
    })
  }

  actions.updateProject = async (id, { title }) => {
    await projectRepository.update(id, { title })
    updateProjects((projects) => {
      Object.assign(projects.byId[id], { title })
    })
  }

  actions.removeProject = async (index) => {
    const id = projects.byOrder[index]
    await projectRepository.remove(id)
    updateProjects((projects) => {
      delete projects[id]
      projects.byOrder.splice(index, 1)
    })
  }

  actions.moveUp = async (index) => {
    const id = projects.byOrder[index]
    const prevId = projects.byOrder[index - 1]

    await Promise.all([
      projectRepository.update(id, { order: index - 1 }),
      projectRepository.update(prevId, { order: index }),
    ])

    updateProjects((projects) => {
      arraySwap(projects.byOrder, index, index - 1)
    })
  }

  actions.moveDown = async (index) => {
    const id = projects.byOrder[index]
    const nextId = projects.byOrder[index + 1]

    await Promise.all([
      projectRepository.update(id, { order: index + 1 }),
      projectRepository.update(nextId, { order: index }),
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
