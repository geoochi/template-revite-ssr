import express from 'express'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'

const prisma = new PrismaClient()
const app = express()

app.use(cors())
app.use(express.json())

// 获取所有 todos
app.get('/api/todos', async (req, res) => {
  const todos = await prisma.todo.findMany()
  res.json(todos)
})

// 创建 todo
app.post('/api/todos', async (req, res) => {
  const { title } = req.body
  const todo = await prisma.todo.create({
    data: { title },
  })
  res.json(todo)
})

// 更新 todo 状态
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params
  const { completed } = req.body
  const todo = await prisma.todo.update({
    where: { id: Number(id) },
    data: { completed },
  })
  res.json(todo)
})

// 删除 todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params
  await prisma.todo.delete({
    where: { id: Number(id) },
  })
  res.json({ message: 'Todo deleted' })
})

const PORT = 5000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
