import { Routes, Route } from 'react-router-dom'
import TodoList from './components/todoList'
import About from './components/about'
import NotFound from './components/notFound'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<TodoList />} />
      <Route path='/about' element={<About />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App
