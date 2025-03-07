import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScriptPlayer from './components/ScriptPlayer';
import './App.css'

function App() {
  return (
    <Router basename="/ScriptBuddy">
      <Routes>
        <Route path="/" element={<ScriptPlayer />} />
      </Routes>
    </Router>
  )
}

export default App 