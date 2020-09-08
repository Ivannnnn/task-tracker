import React from 'react'
import ByDay from './ByDay'
import ByProject from './ByProject'
import { useLocation } from 'wouter'

export default function Statistics({ params: { projectId } }) {
  const [_, setLocation] = useLocation()

  return (
    <div>
      <button onClick={() => setLocation('/')}>{'<<<<'}</button>
      {projectId ? <ByProject id={projectId} /> : <ByDay />}
    </div>
  )
}
