import { Routes, Route } from 'react-router-dom';
import TodoList from './components/Todo';

function App() {
  return (
    <Routes>
      <Route path="/" element={<TodoList />} />
    </Routes>
  );
}

export default App;
