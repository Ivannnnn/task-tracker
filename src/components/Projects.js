import React, { memo, useEffect } from 'react'
import { useCollection } from 'hooks'
import Input from 'components/Input'
import projectRepository from 'db/projectRepository'
import { useLocation } from 'wouter'

const dbSync = {
  create(item) {
    projectRepository.add(item)
  },
  update({ id, ...props }) {
    projectRepository.update(id, props)
  },
  remove({ id }) {
    projectRepository.remove(id)
  },
}

export default function Projects() {
  const projectCollection = useCollection({
    onChange: dbSync,
  })
  const [location, setLocation] = useLocation()

  useEffect(() => {
    projectRepository.all().then((projects) => {
      projectCollection.load(projects)
    })
  }, [])

  const onAddNew = () => {
    if (
      !projectCollection.getLast() ||
      projectCollection.getLast().title !== ''
    ) {
      projectCollection.create({ title: '' })
    }
  }

  const attemptDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      projectCollection.remove(id)
    }
  }

  function renderProject({ id, title }, index) {
    return (
      <div key={id} className="row">
        <div>
          <button
            onClick={() => projectCollection.moveUp(index)}
            className="up"
          >
            ↑
          </button>
          <button
            onClick={() => projectCollection.moveDown(index)}
            className="down"
          >
            ↓
          </button>
        </div>
        <div>
          <Input
            value={title}
            onChange={(title) => projectCollection.update({ id, title })}
          />
        </div>
        <div>
          <button onClick={() => setLocation('/' + id)}>>></button>
        </div>
        <div>
          <button onClick={() => setLocation('/statistics/' + id)}>
            stats
          </button>
        </div>
        <div>
          <button onClick={() => attemptDelete(index)}>X</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="list project-list">
        {projectCollection.map(renderProject)}
      </div>
      <button onClick={onAddNew}>Add</button>
    </div>
  )
}
