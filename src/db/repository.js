import db from './db'
import dataMapper from './dataMapper'

class TableRepository {
  constructor(tableName) {
    this.tableName = tableName
    this.table = db[tableName]
  }

  async all() {
    dataMapper.mapArray(await this.table.toArray(), this.tableName)
  }

  find(id) {
    return this.table.where({ id }).first()
  }

  where(arg) {
    return this.table.where(arg).toArray()
  }

  whereIn(where) {
    const key = Object.keys(where)[0]
    const inArr = where[key]
    return this.table.where(key).anyOf(inArr).toArray()
  }

  add() {}

  update() {}
}

const projects = new TableRepository('projects')
const tasks = new TableRepository('tasks')

projects.delete = (id) => {}
tasks.delete = (id) => {}

const test = async () => {
  projects.all()
}

export default {
  getStatisticsOnDay: () => {},
  getStatisticsOnProject: () => {},

  test,
}
