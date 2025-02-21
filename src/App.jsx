import { BrowserRouter } from 'react-router-dom';
import './App.css'

function App() {
  return (
    <BrowserRouter basename='./ScriptBuddy'>
      <div className="app">
        <header className="app-header">
          <ScriptBuddy />
        </header>
      </div>
    </BrowserRouter>
  )
}

export default App 