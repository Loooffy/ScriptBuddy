import { BrowserRouter } from 'react-router-dom';
import SrtPlayer from './components/SrtPlayer'
import './App.css'

function App() {
  return (
    <BrowserRouter basename='/ScriptBuddy'>
      <div className="app">
        <header className="app-header">
          <SrtPlayer />
        </header>
      </div>
    </BrowserRouter>
  )
}

export default App 