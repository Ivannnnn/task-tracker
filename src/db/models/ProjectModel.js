import { createModel, uuid } from './utils'

const TaskModel = createModel({
  id: () => uuid(),
  title: '',
  order: null,
})

export default TaskModel
