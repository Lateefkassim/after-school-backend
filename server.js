const express = require('express')
const path = require('path')
const { MongoClient, ObjectId } = require('mongodb')

const app = express()
let lessons
let orders
let teachers

// logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url)
  next()
})

// allow the vue app to call this server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

app.use(express.json())

// lesson images
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use('/images', (req, res) => {
  res.status(404).json({ error: 'Image not found' })
})

app.get('/', (req, res) => {
  res.send('After school API is running')
})

// get all lessons
app.get('/lessons', async (req, res) => {
  try {
    const result = await lessons.find().toArray()
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// search lessons by topic, location, price or space
app.get('/search', async (req, res) => {
  try {
    const text = (req.query.q || '').toLowerCase()
    const all = await lessons.find().toArray()
    const result = all.filter((lesson) => {
      return (
        lesson.topic.toLowerCase().includes(text) ||
        lesson.location.toLowerCase().includes(text) ||
        String(lesson.price).includes(text) ||
        String(lesson.space).includes(text)
      )
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// save a new order
app.post('/orders', async (req, res) => {
  try {
    const { name, phone, items } = req.body

    if (!/^[A-Za-z ]+$/.test(name)) {
      return res.status(400).json({ error: 'Name must be letters only' })
    }
    if (!/^[0-9]+$/.test(phone)) {
      return res.status(400).json({ error: 'Phone must be numbers only' })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order has no lessons' })
    }

    const orderItems = []
    for (const item of items) {
      if (!ObjectId.isValid(item.lessonId)) {
        return res.status(400).json({ error: 'Invalid lesson id' })
      }
      orderItems.push({ lessonId: new ObjectId(item.lessonId), spaces: item.spaces })
    }

    const result = await orders.insertOne({ name, phone, items: orderItems })
    res.status(201).json({ message: 'Order saved', orderId: result.insertedId })
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// update any field of a lesson
app.put('/lessons/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid lesson id' })
    }

    const allowed = ['topic', 'location', 'price', 'space', 'icon', 'image']
    const changes = {}
    for (const key in req.body) {
      if (allowed.includes(key)) {
        changes[key] = req.body[key]
      }
    }
    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' })
    }

    const result = await lessons.updateOne({ _id: new ObjectId(req.params.id) }, { $set: changes })
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Lesson not found' })
    }
    res.json({ message: 'Lesson updated' })
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// how many spaces have been bought for a lesson
app.get('/enrolment/:lessonid', async (req, res) => {
  try {
    const id = req.params.lessonid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid lesson id' })
    }

    const allOrders = await orders.find().toArray()
    let enrolment = 0
    for (const order of allOrders) {
      for (const item of order.items) {
        if (item.lessonId.toString() === id) {
          enrolment = enrolment + item.spaces
        }
      }
    }
    res.json({ lessonId: id, enrolment: enrolment })
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// get all teachers
app.get('/teachers', async (req, res) => {
  try {
    const result = await teachers.find().toArray()
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// get the lessons taught by one teacher
app.get('/teachers/:id/lessons', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid teacher id' })
    }

    const teacher = await teachers.findOne({ _id: new ObjectId(req.params.id) })
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' })
    }

    const result = await lessons.find({ _id: { $in: teacher.lessonIds } }).toArray()
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// connect to the database then start the server
if (!process.env.MONGODB_URI) {
  console.log('MONGODB_URI is missing. Run the server with: npm run dev')
  process.exit(1)
}

const client = new MongoClient(process.env.MONGODB_URI)
client
  .connect()
  .then(() => {
    const db = client.db('afterschool')
    lessons = db.collection('lesson')
    orders = db.collection('order')
    teachers = db.collection('teacher')
    console.log('Connected to MongoDB')

    const port = process.env.PORT || 3000
    app.listen(port, () => console.log('Server running on port ' + port))
  })
  .catch((err) => console.log('Could not connect to MongoDB', err))
