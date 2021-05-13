require('dotenv').config()
const express = require('express')
const app = express()  
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


app.use(express.json())
app.use(cors())
app.use(express.static('build'))
app.use(morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.data(req, res)
    ].join(' ')
  }))
  

morgan.token('data', (req) => {
    return req.method === 'POST'
      ? JSON.stringify(req.body)
      : null
})
  

let persons = [
    {
      id: 1,
      name: "Arto Hellas",
      number: "040-123456",
    },
    {
      id: 2,
      name: "Ada Lovelace",
      number: "39-44-5323523",
    },
    {
      id: 3,
      name: "Dan Abramov",
      number: "12-43-234345",
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122",
    }
]


app.get('/info', (request, response) => {
    const d = new Date()
    response.write(`Phonebook has info for ${persons.length} people\n`)
    response.write(d.toString())
    response.end()
})

  
app.get('/api/persons', (request, response) => {
  Person.find({}).then(person => {
    response.json(person)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(() => response.status(204).end())
    .catch((error) => next(error))
})
  
app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  // const isDuplicate = persons.find(element => element.name === body.name)
  // if (isDuplicate) {
  //     return response.status(400).json({
  //         error: 'duplicate entry'
  //     }) 
  //}

  const person = new Person ({
    name: body.name,
    number: body.number,
  })
  person.save().then(savedNote => {
    response.json(savedNote)
  }).catch((error) => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  const entry = {
    name: req.body.name,
    number: req.body.number,
  }

  Person.findByIdAndUpdate(id, entry, { new: true })
    .then((updatedEntry) => {
      if (updatedEntry) {
        res.json(updatedEntry.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  console.log("hello")
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


