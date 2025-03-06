import { BrowserRouter } from 'react-router-dom';
import ScriptPlayer from './components/ScriptPlayer';
import './App.css'

function App() {
  return (
    <BrowserRouter basename='/ScriptBuddy'>
      <div className="app">
        <header className="app-header">
          <ScriptPlayer />
        </header>
      </div>
    </BrowserRouter>
  )
}

export default App 