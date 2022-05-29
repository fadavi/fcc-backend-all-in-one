#!/usr/bin/env node
const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const os = require('os')

const urlShortener = require('./url-shortener')()
const validateUrl = require('./validate-url')
const dao = require('./exercise-dao')()
const asDate = require('./as-date')

const upload = multer({ dest: os.tmpdir() })
const app = express()

app.use(cors({ optionSuccessStatus: 200 }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Timestamp Microservice
app.all('/api/:date?', (req, res) => {
  let date
  
  if ({}.hasOwnProperty.call(req.params, 'date')) {
    date = asDate(req.params.date)
  } else {
    date = new Date()
  }

  if (!date || isNaN(date)) {
    return res.status(400).jsonp({ error: 'Invalid Date' })
  }

  res.jsonp({
    utc: date.toUTCString(),
    unix: date.getTime(),
  })
})

// Request Header Parser Microservice
app.all('/api/whoami', (req, res) => {
  res.jsonp({
    ipaddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    language: req.headers['accept-language'],
    software: req.headers['user-agent'],
  })  
})

// URL Shortener Microservice
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body

  if (!validateUrl(url)) {
    return res.status(400).jsonp({ error: 'invalid url' })
  }

  const result = urlShortener.add(url)
  return res.status(201).jsonp(result)
})

// URL Shortener Microservice
app.get('/api/shorturl/:urlId', (req, res) => {
  const { urlId } = req.params
  const originalUrl = urlShortener.find(urlId)

  if (!originalUrl) {
    return res.sendStatus(404)
  }

  res.redirect(originalUrl)
})

// File Metadata Microservice
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  res.jsonp({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
  })
})

// Exercise Tracker
app.post('/api/users', (req, res) => {
  const { username } = req.body
  const user = new dao.User(username)
  dao.addUser(user)

  res.status(201).jsonp(user)
})

// Exercise Tracker
app.get('/api/users', (_, res) => {
  res.jsonp(dao.getUsers())
})

// Exercise Tracker
app.post('/api/users/:userId/exercises', (req, res) => {
  const { description, duration, date } = req.body
  const { userId } = req.params
  
  const user = dao.findUser(userId)
  if (!user) {
    return res.sendStatus(404)
  }
  
  const exercise = new dao.Exercise({ description, duration, date })
  user.addExercise(exercise)

  res.status(201).jsonp(user.toJSON({ withExercise: true }))
})

// Exercise Tracker
app.get('/api/users/:userId/logs', (req, res) => {
  const { from, to, limit } = req.query
  const { userId } = req.params

  const user = dao.findUser(userId)
  if (!user) {
    return res.sendStatus(404)
  }

  const log = user.getLog({ from, to, limit })

  res.jsonp({
    ...user.toJSON(),
    count: log.length,
    log,
  })
})

if (require.main === module) {
  const listener = app.listen(process.env.PORT || 7357, () => {
    console.log('Listening on port ' + listener.address().port)
  })
}

module.exports = { app }
