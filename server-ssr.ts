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
  const todo = await prisma.todo.create({
    data: { title },
  })
  res.json(todo)
})

// update todo
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params
  const { completed } = req.body
  const todo = await prisma.todo.update({
    where: { id: Number(id) },
    data: { completed },
  })
  res.json(todo)
})

// delete todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params
  await prisma.todo.delete({
    where: { id: Number(id) },
  })
  res.json({ message: 'Todo deleted' })
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
  if (!url.startsWith('/api/') && !url.match(/\.(js|css|ico|png|jpg|jpeg|gif|svg)$/)) {
    try {
      console.log('Handling SSR request for URL:', url)

      let template: string
      let render: (url: string) => { html: string }

      if (!isProd) {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
      } else {
        console.log('Production mode: Loading template and server entry')
        const templatePath = path.resolve(__dirname, 'dist/client/index.html')
        const serverEntryPath = path.resolve(__dirname, 'dist/server/entry-server.js')

        console.log('Template path:', templatePath)
        console.log('Server entry path:', serverEntryPath)

        template = fs.readFileSync(templatePath, 'utf-8')
        console.log('Template loaded:', template.includes('<!--app-html-->'))

        const serverEntry = await import(`file://${serverEntryPath}`)
        console.log('Server entry loaded:', !!serverEntry.render)
        render = serverEntry.render
      }

      console.log('Server rendering for URL:', url)
      const { html: appHtml } = render(url)
      console.log('Server rendered HTML length:', appHtml.length)
      const html = template.replace('<!--app-html-->', appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e: any) {
      console.error('SSR Error:', e)
      vite?.ssrFixStacktrace(e)
      console.error(e.stack)
      res.status(500).end(e.stack)
    }
  } else {
    next()
  }
})

const PORT = 5000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
