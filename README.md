# After School Classes - Backend

This is the Express.js server for my after school classes app (CST3144). It uses Node.js, Express and the MongoDB driver, and the data is kept in MongoDB Atlas.

## How to run it

1. Run `npm install`
2. Make a `.env` file (copy `.env.example`) and put my MongoDB link in `MONGODB_URI`
3. Run `npm run seed` once to add the lessons and teachers
4. Run `npm run dev` and open http://localhost:3000/lessons

## Routes

- `GET /lessons` - all the lessons
- `GET /search?q=hen` - search by subject, location, price or spaces
- `POST /orders` - save a new order
- `PUT /lessons/:id` - change a lesson, for example `{ "space": 3 }`
- `GET /enrolment/:lessonid` - how many spaces have been bought for a lesson
- `GET /teachers` - all the teachers
- `GET /teachers/:id/lessons` - the lessons of one teacher
- `GET /images/math.svg` - a lesson image (shows an error if the image is not there)

My Postman requests are in the `postman` folder.

## Links

- Vue.js app repository: https://github.com/Lateefkassim/after-school-frontend
- Vue.js app on GitHub Pages: https://lateefkassim.github.io/after-school-frontend/
- Express.js app repository: https://github.com/Lateefkassim/after-school-backend
- Lessons route on Render: https://m01142449-after-school.onrender.com/lessons
