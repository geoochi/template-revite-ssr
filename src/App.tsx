import { Routes, Route } from 'react-router-dom'
import TodoList from './components/todoList'
import About from './components/about'
import Layout from './components/layout'

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path='/' element={<TodoList />} />
        <Route path='/about' element={<About />} />
      </Routes>
    </Layout>
  )
}

export default App
