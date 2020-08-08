import { createContainer } from 'unstated-next'
import { useImmer } from 'hooks'
import db from 'services/db'

const useStore = () => {
  const [projects, updateProjects] = useImmer()

  const actions = {}

  actions.loadProjects = async () => {
    const projects = await db.projects.all()
    updateProjects(() => projects)
  }

  actions.addProject = async () => {
    const newProject = { title: '' }
    const id = await db.projects.add(newProject)
    updateProjects((projects) => {
      projects[id] = newProject
    })
  }

  actions.updateProject = async (id, { title }) => {
    await db.projects.update(id, { title })
    updateProjects((projects) => {
      Object.assign(projects[id], { title })
    })
  }

  actions.removeProject = async (id) => {
    await db.projects.remove(id)
    updateProjects((projects) => {
      delete projects[id]
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
