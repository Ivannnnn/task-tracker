import Dexie from 'dexie'
import { keyBy } from 'utils'

const addKeyBy = (db) => {
  db.Collection.prototype.keyBy = async function (key) {
    return keyBy(await this.toArray(), key)
  }

  db.Table.prototype.keyBy = async function (key) {
    return keyBy(await this.toArray(), key)
  }
}

const addWhereIn = (db) => {
  db.Table.prototype.whereIn = function (where) {
    const key = Object.keys(where)[0]
    const inArr = where[key]
    return this.where(key).anyOf(inArr)
  }
}

const db = new Dexie('db', { addons: [addKeyBy, addWhereIn] })

db.version(1).stores({
  projects: 'id, title', // order
  tasks: 'id, projectId', // title, estimate, order
  times: '++id, day, taskId', // duration
})

db['projects'].hook('deleting', function (projectId) {
  this.onsuccess = async () => {
    setTimeout(() => db.tasks.where({ projectId }).delete(), 0)
  }
})

db['tasks'].hook('deleting', function (taskId) {
  setTimeout(() => db.times.where({ taskId }).delete(), 0)
})

export default db
