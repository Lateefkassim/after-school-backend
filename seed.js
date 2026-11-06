// run with: npm run seed
// this deletes and re-adds the lessons and teachers
const { MongoClient } = require('mongodb')

const teacherList = [
  { firstName: 'Sarah', lastName: 'Johnson', lessonIds: [] },
  { firstName: 'David', lastName: 'Okafor', lessonIds: [] },
  { firstName: 'Priya', lastName: 'Patel', lessonIds: [] },
  { firstName: 'Michael', lastName: 'Brown', lessonIds: [] },
  { firstName: 'Elena', lastName: 'Rossi', lessonIds: [] },
]

// teacher is the position of the teacher in teacherList
const lessonList = [
  { topic: 'Math', location: 'Hendon', price: 100, space: 5, icon: 'fa-solid fa-calculator', image: 'math.svg', teacher: 0 },
  { topic: 'English', location: 'Colindale', price: 80, space: 5, icon: 'fa-solid fa-book-open', image: 'english.svg', teacher: 0 },
  { topic: 'Science', location: 'Brent Cross', price: 90, space: 5, icon: 'fa-solid fa-flask', image: 'science.svg', teacher: 1 },
  { topic: 'Football', location: 'Golders Green', price: 60, space: 5, icon: 'fa-solid fa-futbol', image: 'football.svg', teacher: 1 },
  { topic: 'Music', location: 'Hendon', price: 95, space: 5, icon: 'fa-solid fa-music', image: 'music.svg', teacher: 2 },
  { topic: 'Art', location: 'Colindale', price: 70, space: 5, icon: 'fa-solid fa-palette', image: 'art.svg', teacher: 2 },
  { topic: 'Coding', location: 'Brent Cross', price: 110, space: 5, icon: 'fa-solid fa-laptop-code', image: 'coding.svg', teacher: 3 },
  { topic: 'Chess', location: 'Golders Green', price: 50, space: 5, icon: 'fa-solid fa-chess', image: 'chess.svg', teacher: 3 },
  { topic: 'Drama', location: 'Hendon', price: 85, space: 5, icon: 'fa-solid fa-masks-theater', image: 'drama.svg', teacher: 4 },
  { topic: 'Swimming', location: 'Colindale', price: 120, space: 5, icon: 'fa-solid fa-person-swimming', image: 'swimming.svg', teacher: 4 },
]

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db('afterschool')

  await db.collection('lesson').deleteMany({})
  await db.collection('teacher').deleteMany({})

  // add the teachers first so every lesson can save its teacher id
  const teacherResult = await db.collection('teacher').insertMany(teacherList)
  const teacherIds = Object.values(teacherResult.insertedIds)

  for (const lesson of lessonList) {
    lesson.teacherId = teacherIds[lesson.teacher]
    delete lesson.teacher
  }
  const lessonResult = await db.collection('lesson').insertMany(lessonList)
  const lessonIds = Object.values(lessonResult.insertedIds)

  // save the lesson ids on each teacher
  for (let i = 0; i < lessonList.length; i++) {
    await db.collection('teacher').updateOne(
      { _id: lessonList[i].teacherId },
      { $push: { lessonIds: lessonIds[i] } }
    )
  }

  console.log('Added ' + lessonList.length + ' lessons and ' + teacherList.length + ' teachers')
  await client.close()
}

seed()
