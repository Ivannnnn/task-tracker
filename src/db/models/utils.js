import { pick, intersect } from 'utils'

export function createModel(definition) {
  const allowed = Object.keys(definition)
  const required = Object.keys(definition).filter(
    (key) => definition[key] === true
  )
  const defaults = pick(
    definition,
    Object.keys(definition).filter((key) => definition[key] !== true)
  )

  function assignDefaults(props) {
    props = Object.assign({}, defaults, props)
    for (let key in props)
      if (typeof props[key] === 'function') props[key] = props[key]()
    return props
  }

  return function (props) {
    props = assignDefaults(props)
    const fieldsLacking = intersect(required, Object.keys(props))
    if (fieldsLacking.length)
      throw new Error(`Fields { ${fieldsLacking.join(', ')} } are lacking!`)
    return pick(props, allowed)
  }
}

export function uuid(a) {
  return a
    ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid)
}
