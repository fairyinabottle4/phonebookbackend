const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.d60mz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})


const Person = mongoose.model('Person', personSchema)

if (!name && !number) {
    //the below is for getting persons stored in the database
    Person.find({}).then(result => {
        result.forEach(person => {
        console.log(person)
        })
        mongoose.connection.close()
    })
} else {
    const person = new Person({
        name: name,
        number: number
      })
      person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
      })
      
}

