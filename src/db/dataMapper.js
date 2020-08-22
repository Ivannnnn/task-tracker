const defaults = {
  task: {},
  project: {},
}

const dataMapper = {
  tasksItem: (tasks, times) => {},
  projectsItem: (project) => {
    return { ...project, drogba: 'didier' }
  },

  mapArray: (data, table) => {
    const mapped = data.map(dataMapper[table + 'Item'])

    console.log(mapped)
  },

  byDay: ({ projects, tasks, times }) => {},

  byProject: ({ projects, tasks, times }) => {},
}

export default dataMapper
