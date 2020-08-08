import React, { useState, useEffect } from 'react'
import { createContainer } from 'unstated-next'
import { uuid, proxyStorage } from 'utils'
import { useImmer } from 'hooks'

const createProject = () => [uuid(), { title: '', taskIds: [] }]

const useStore = () => {
  const [projects, updateProjects] = useImmer()

  const actions = {}

  actions.loadProjects = () => {
    const projects = {}
    ;(proxyStorage.projectIds || []).forEach((projectId) => {
      projects[projectId] = proxyStorage[projectId]
    })
    updateProjects(() => projects)
  }

  actions.updateProjectTasks = (projectId, taskIds) => {
    updateProjects((projects) => {
      projects[projectId].taskIds = taskIds
      proxyStorage[projectId] = projects[projectId]
    })
  }

  actions.addProject = () => {
    updateProjects((projects) => {
      const [id, newProject] = createProject()
      proxyStorage[id] = newProject
      proxyStorage.projectIds = [...(proxyStorage.projectIds || []), id]
      projects[id] = newProject
    })
  }

  actions.updateProjectTitle = (id, title) => {
    updateProjects((projects) => {
      projects[id].title = title
      proxyStorage[id] = projects[id]
    })
  }

  actions.removeProject = (id) => {
    updateProjects((projects) => {
      const tasksToRemove = [...projects[id].taskIds]
      delete projects[id]
      delete proxyStorage[id]
      proxyStorage.projectIds = Object.keys(projects)

      tasksToRemove.forEach((taskId) => {
        delete proxyStorage[taskId]
      })
    })
  }

  /*
  on('task:remove', id => {
    updateProjects(projects => {
      
    })
  })
*/

  return {
    projects,
    actions,
    get projectsLoaded() {
      return !!projects
    },
  }
}

export default createContainer(useStore)
