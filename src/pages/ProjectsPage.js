import React, { useEffect, useRef } from 'react'
import repository from 'db/repository'
import { useOrderable } from 'hooks'
import { useLocation } from 'wouter'
import Project from 'db/models/ProjectModel'
import Icon from 'components/Icon'
import { classes } from 'utils'

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
  const table = useRef()

  function focusRowAtIndex(index) {
    table.current.querySelector(`tr:nth-child(${index + 1}) input`).focus()
  }

  const stop = (cb) => (e) => {
    e.stopPropagation()
    cb && cb(e)
  }

  function handleAddNew() {
    const first = projects[0]
    if (!first || first.title !== '') {
      createProject()
      setTimeout(() => focusRowAtIndex(0))
    }
  }

  function handleRemove(index) {
    if (window.confirm('Are you sure you want to delete this project?')) {
      removeProject(index)
    }
  }

  function renderProjectItem({ id, title }, index) {
    const last = projects.length - 1 === index

    return (
      <tr
        key={id}
        className={classes(
          'cursor-pointer py-1 border-blue-100 ',
          !last && 'border-b-2'
        )}
        onClick={stop(() => focusRowAtIndex(index))}
      >
        <td className="flex flex-col h-full p-0" style={{ width: '18px' }}>
          <button
            className="bg-gray-200 text-md p-1 h-1/2"
            onClick={stop(() => moveProject('up', index))}
          >
            <Icon type="up" />
          </button>
          <button
            className="bg-gray-200 text-md p-1 h-1/2"
            onClick={stop(() => moveProject('down', index))}
          >
            <Icon type="down" />
          </button>
        </td>

        <td className="px-2 py-1 whitespace-no-wrap relative">
          <input
            type="text"
            className="resize-none px-2 py-1 mx-2 overflow-hidden w-full bg-transparent text-sm outline-none cursor-pointer focus:cursor-text"
            value={title}
            onChange={(e) => updateProject(index, { title: e.target.value })}
            spellCheck={false}
          />
        </td>

        <td className="w-8">
          <div className="flex items-center justify-end">
            <div
              onClick={stop(() => handleRemove(index))}
              className="p-2 w-8 rounded-full block hover:bg-gray-200"
            >
              <Icon type="remove" />
            </div>
            <div
              onClick={stop(() => redirect(`/statistics/${id}`))}
              className="p-2 w-8 rounded-full block hover:bg-gray-200"
            >
              <Icon type="charts" />
            </div>
            <div
              onClick={stop(() => redirect('/' + id))}
              className="w-10 p-2 mr-2 rounded-full block hover:bg-gray-200"
            >
              <Icon type="go" />
            </div>
          </div>
        </td>
      </tr>
    )
  }

  function renderProjectList() {
    return (
      <div className="w-full overflow-auto shadow bg-white mb-6">
        <table className="h-px w-full" ref={table}>
          <tbody>{projects.map(renderProjectItem)}</tbody>
        </table>
      </div>
    )
  }

  return (
    <div
      className="container mx-auto pt-10"
      style={{ height: 'calc(100vh - 112px)' }}
    >
      <h1 className="text-xl mx-8 mb-4">Projects</h1>
      <div className="max-w-lg pl-4 h-full flex flex-col">
        <div className="bg-white text-sm text-gray-700 font-bold px-5 py-2 shadow border-b border-gray-300 flex">
          <button
            onClick={handleAddNew}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-4 rounded inline-flex items-center"
          >
            Add
          </button>
        </div>
        {projects.length ? (
          renderProjectList()
        ) : (
          <p>No projects created yet.</p>
        )}
      </div>
    </div>
  )
}
