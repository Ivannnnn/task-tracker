import Dexie from 'dexie'
import { keyBy } from 'utils'

const addKeyBy = (db) => {
  const keyByAddon = async function (key) {
    return keyBy(await this.toArray(), key)
  }
  db.Collection.prototype.keyBy = keyByAddon
  db.Table.prototype.keyBy = keyByAddon
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

export default db
