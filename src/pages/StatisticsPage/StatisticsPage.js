import React from 'react'
import ByDay from './ByDay'
import ByProject from './ByProject'
import { useLocation } from 'wouter'

export default function Statistics({ params: { projectId } }) {
  return projectId ? <ByProject id={projectId} /> : <ByDay />
}
