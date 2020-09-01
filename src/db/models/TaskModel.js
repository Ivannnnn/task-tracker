import { createModel, uuid } from './utils'

const TaskModel = createModel({
  id: () => uuid(),
  projectId: true,
  title: '',
  estimate: 0,
  order: null,
})

export default TaskModel
