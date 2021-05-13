require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()  
const Person = require('./models/person')

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

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
})
  
const generateId = () => {
  const maxInteger = Number.MAX_SAFE_INTEGER  
  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  } 
  return getRandomArbitrary(0, maxInteger)
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const isDuplicate = persons.find(element => element.name === body.name)
  if (isDuplicate) {
      return response.status(400).json({
          error: 'duplicate entry'
      }) 
  }

  const person = {
    name: body.name,
    number: body.number,
  }

  person.save().then(savedNote => {
    response.json(savedNote)
  })
})

  
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

