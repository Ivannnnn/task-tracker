import React from 'react'
import { useLocation } from 'wouter'

const Brand = ({ children }) => {
  return (
    <a
      href="#"
      className="text-lg font-semibold tracking-widest text-gray-900 uppercase rounded-lg dark-mode:text-white"
    >
      {children}
    </a>
  )
}

export default function Navbar() {
  const [location, setLocation] = useLocation()

  return (
    <div className="w-full text-gray-700 bg-white dark-mode:text-gray-200 dark-mode:bg-gray-800">
      <div className="flex flex-col max-w-screen-xl px-4 mx-auto md:items-center md:justify-between md:flex-row md:px-6 lg:px-8">
        <div className="p-4 flex flex-row items-center justify-between">
          <Brand>Task-Tracker</Brand>
        </div>
        <nav className="flex-col flex-grow pb-4 md:pb-0 hidden md:flex md:justify-end md:flex-row">
          <button
            className="focus:outline-none"
            onClick={() => setLocation('/statistics')}
          >
            Stats by day
          </button>
        </nav>
      </div>
    </div>
  )
}
