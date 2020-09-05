import React from 'react'
import ByDay from './ByDay'
import ByProject from './ByProject'

export default function Statistics({ params: { projectId } }) {
  return projectId ? <ByProject id={projectId} /> : <ByDay />
}
