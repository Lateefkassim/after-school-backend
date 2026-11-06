# After School Classes - Express.js API (CST3144)

REST API for the after school classes app. Built with Node.js, Express.js and the native MongoDB driver (no Mongoose). Data is stored in MongoDB Atlas.

## Run locally

```sh
npm install
cp .env.example .env   # then fill in MONGODB_URI
npm run seed           # one time: creates 10 lessons and 5 teachers
npm run dev            # http://localhost:3000
```

## Routes

| Route | Purpose |
|---|---|
| `GET /lessons` | all lessons |
| `GET /search?q=` | search topic, location, price and space |
| `POST /orders` | save a new order |
| `PUT /lessons/:id` | update any lesson field, e.g. `{ "space": 3 }` |
| `GET /enrolment/:lessonid` | spaces already purchased for a lesson |
| `GET /teachers` | all teachers |
| `GET /teachers/:id/lessons` | lessons taught by one teacher |
| `GET /images/<file>` | lesson image, or a JSON error if it does not exist |

Postman requests are in `postman/after-school-api.postman_collection.json`.

## Links

- [Vue.js App] GitHub repository: _to add_
- [Vue.js App] GitHub Pages: _to add_
- [Express.js App] GitHub repository: _to add_
- [Express.js App] render.com /lessons route: _to add_
