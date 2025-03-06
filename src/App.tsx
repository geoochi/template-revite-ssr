import { Routes, Route } from 'react-router-dom'
import TodoList from './components/todoList'
import About from './components/about'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<TodoList />} />
      <Route path='/about' element={<About />} />
    </Routes>
  )
}

export default App
