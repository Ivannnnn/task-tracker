import React, { useEffect } from 'react'
import Input from 'components/Input'
import repository from 'db/repository'
import { useOrderable } from 'hooks'
import { useLocation } from 'wouter'
import Project from 'db/models/ProjectModel'

export default function Container() {
  const [_, setLocation] = useLocation()
  const [projects, projectMethods] = useOrderable('order')

  useEffect(() => {
    ;(async function () {
      projectMethods.set(await repository.getAllProjects())
    })()
  }, [])

  async function removeProject(index) {
    const [project, revert] = await projectMethods.remove(index)
    repository.removeProject(project).catch(revert)
  }
  async function updateProject(index, props) {
    const [project, revert] = await projectMethods.update(index, props)
    repository.updateProject(project).catch(revert)
  }
  async function moveProject(direction, index) {
    const [firstProject, secondProject, revert] = await projectMethods.move(
      direction,
      index
    )
    return Promise.all([
      repository.updateProject(firstProject),
      repository.updateProject(secondProject),
    ]).catch(revert)
  }
  async function createProject() {
    const newProject = new Project()
    const [order, revert] = await projectMethods.add(newProject)
    return repository.addProject({ ...newProject, order }).catch(revert)
  }

  const redirect = (path) => setLocation(path)

  return (
    <Projects
      {...{
        projects,
        redirect,
        removeProject,
        updateProject,
        moveProject,
        createProject,
      }}
    />
  )
}

function Projects({
  projects,
  redirect,
  removeProject,
  updateProject,
  moveProject,
  createProject,
}) {
  function handleAddNew() {
    const last = projects[projects.length - 1]
    if (!last || last.title !== '') createProject()
  }

  function handleDelete(index) {
    if (window.confirm('Are you sure you want to delete this project?')) {
      removeProject(index)
    }
  }

  function renderProject({ id, title }, index) {
    return (
      <div key={id} className="row">
        <div>
          <button onClick={() => moveProject('up', index)} className="up">
            ↑
          </button>
          <button onClick={() => moveProject('down', index)} className="down">
            ↓
          </button>
        </div>
        <div>
          <Input
            value={title}
            onChange={(title) => updateProject(index, { title })}
          />
        </div>
        <div>
          <button onClick={() => redirect('/' + id)}>>></button>
        </div>
        <div>
          <button onClick={() => redirect('/statistics/' + id)}>stats</button>
        </div>
        <div>
          <button onClick={() => handleDelete(index)}>X</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="list project-list">{projects.map(renderProject)}</div>
      <button onClick={handleAddNew}>Add</button>
    </div>
  )
}
