import { useState, useEffect } from 'react'

interface Todo {
  id: number
  title: string
  completed: boolean
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    const response = await fetch('/api/todos')
    const data = await response.json()
    setTodos(data)
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTodo }),
    })
    setNewTodo('')
    fetchTodos()
  }

  const toggleTodo = async (id: number, completed: boolean) => {
    await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    })
    fetchTodos()
  }

  const deleteTodo = async (id: number) => {
    await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    })
    fetchTodos()
  }

  return (
    <div className='max-w-sm w-full'>
      <h1 className='text-2xl font-bold mb-4'>Todo List</h1>
      <form onSubmit={addTodo} className='mb-4'>
        <input
          type='text'
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          placeholder='Add new todo'
          className='w-full p-2 border rounded'
        />
      </form>
      <ul className='space-y-2'>
        {todos.map(todo => (
          <li key={todo.id} className='flex items-center justify-between p-2 border rounded'>
            <div className='flex items-center'>
              <input
                type='checkbox'
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
                className='mr-2'
              />
              <span className={todo.completed ? 'line-through' : ''}>{todo.title}</span>
            </div>
            <button onClick={() => deleteTodo(todo.id)} className='text-red-500'>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TodoList
