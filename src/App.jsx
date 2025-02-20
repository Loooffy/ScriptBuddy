import { useState } from 'react'
import SrtPlayer from './components/SrtPlayer'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <SrtPlayer />
      </header>
    </div>
  )
}

export default App 