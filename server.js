import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())

app.get('/proxy', async (req, res) => {
  const url = req.query.url
  if (!url) return res.status(400).send('url query is required')

  try {
    const resp = await fetch(url)
    const html = await resp.text()
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  } catch (e) {
    res.status(500).send('fetch failed')
  }
})

app.listen(5174, () => console.log('proxy on http://localhost:5174'))
