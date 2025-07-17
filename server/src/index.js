const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

let canvasData = { tasks: [], states: [], links: [] }

app.get('/api/canvas', (req, res) => {
  res.json(canvasData)
})

app.post('/api/canvas', (req, res) => {
  canvasData = req.body
  res.json({ status: 'saved' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
