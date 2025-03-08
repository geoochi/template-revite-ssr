import express from 'express'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()
const app = express()

app.use(cors())
app.use(express.json())

// get todos
app.get('/api/todos', async (req, res) => {
  const todos = await prisma.todo.findMany()
  res.json(todos)
})

// create todo
app.post('/api/todos', async (req, res) => {
  const { title } = req.body
  try {
    const todo = await prisma.todo.create({
      data: { title },
    })
    res.json(todo)
  } catch (e: any) {
    console.error('Error creating todo:', e)
    res.status(500).json({ error: 'Failed to create todo' })
  }
})

// update todo
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params
  const { completed } = req.body
  try {
    const todo = await prisma.todo.update({
      where: { id: Number(id) },
      data: { completed },
    })
    res.json(todo)
  } catch (e: any) {
    console.error('Error updating todo:', e)
    res.status(500).json({ error: 'Failed to update todo' })
  }
})

// delete todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params
  try {
    await prisma.todo.delete({
      where: { id: Number(id) },
    })
    res.json({ message: 'Todo deleted' })
  } catch (e: any) {
    console.error('Error deleting todo:', e)
    res.status(500).json({ error: 'Failed to delete todo' })
  }
})

// Handle 404 for unmatched API routes
app.use('/api*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
  })
})

// SSR logic
let vite: any
const isProd = process.env.NODE_ENV === 'production'

// Serve static files in production
if (!isProd) {
  vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })
  app.use(vite.middlewares)
} else {
  app.use(
    express.static(path.resolve(__dirname, 'dist/client'), {
      index: false, // This is important - let SSR handle index.html
    })
  )
}

app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  // Skip SSR for non-HTML requests
  try {
    // console.log('Handling SSR request for URL:', url)

    let template: string
    let render: (url: string) => { html: string }

    if (!isProd) {
      template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
    } else {
      // console.log('Production mode: Loading template and server entry')
      template = fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8')
      const serverEntryPath = path.resolve(__dirname, 'dist/server/entry-server.js')

      // console.log('Template path:', templatePath)
      // console.log('Server entry path:', serverEntryPath)

      // console.log('Template loaded:', template.includes('<!--app-html-->'))

      const serverEntry = await import(`file://${serverEntryPath}`)
      // console.log('Server entry loaded:', !!serverEntry.render)
      render = serverEntry.render
    }

    // console.log('Server rendering for URL:', url)
    const { html: appHtml } = render(url)
    // console.log('Server rendered HTML length:', appHtml.length)
    const html = template.replace('<!--app-html-->', appHtml)

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e: any) {
    console.error('SSR Error:', e)
    vite?.ssrFixStacktrace(e)
    console.error(e.stack)
    res.status(500).end(e.stack)
  }
})

const PORT = 3004
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
