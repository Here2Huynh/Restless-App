
const config = require('config')
const morgan = require('morgan')
const helmet = require('helmet')
const Joi = require('joi')
const logger = require('./logger')
const authenicater = require('./authenticator')

const express = require('express')
const app = express()

// configuration
console.log('Application Name: ' + config.get('name'))
console.log('Mail Server: ' + config.get('mail.host'))
console.log('Mail Password: ' + config.get('mail.password'))

// console.log(`NODE_ENV: ${process.env.NODE_ENV}`) //return environment of the app, if not set it will be undefined

// console.log(`app: ${app.get('env')}`) // returns development by default

if ( app.get('env') === 'development' ) {
    app.use(morgan('tiny'))
    console.log('Morgan enabled...')
}


// adding middleware to process the req body
app.use(express.json()) // parses req.body
app.use(express.urlencoded({ extended: true })) // key=value&key=value
app.use(express.static('public'))
app.use(helmet())


app.use(logger)

app.use(authenicater)

const courses = [
    { id: 1, name: 'course1'},
    { id: 2, name: 'course2'},
    { id: 3, name: 'course3'},
]

app.get('/', (req, res) => {
    res.send('Hello world!!!!!!')
})

app.get('/api/courses', (req , res) => {
    res.send(courses)
})

// POST
app.post('/api/courses', (req,res) => {
    const { error } = validateCourse(req.body)

    if ( error ) return res.status(400).send(error.details[0].message)
 

    const course = {
        id: courses.length + 1,
        name: req.body.name
    }
    courses.push(course)
    res.send(course)
})

// PUT = updating resources
app.put('/api/courses/:id', (req, res) => {
    // look up the course
    // if it doesn't exist, return 404
    const course = courses.find(c => c.id === parseInt(req.params.id))
    if ( !course ) return res.status(404).send('The course with the given ID was not found.')
 
    // validate
    // if invalid, return 400 - Bad request
    // const result = validateCourse(req.body)
    const { error } = validateCourse(req.body) // result.error 

    if ( error ) return res.status(400).send(error.details[0].message)
  

    // update course 
    // return the updated course
    course.name = req.body.name
    res.send(course)
})


function validateCourse(course) {
    const schema = {
        name: Joi.string().min(3).required()
    }

    return Joi.validate(course, schema)
}

app.delete('/api/courses/:id', (req,res) => {
    // look up the course
    // if doesn't exist, return 404
    const course = courses.find(c => c.id === parseInt(req.params.id))
    if ( !course ) return res.status(404).send('The course with the given ID was not found.')

    // delete
    const index = courses.indexOf(course)
    courses.splice(index,1)

    // return the same course
    res.send(course)
})


app.get('/api/courses/:id', (req , res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id))
    if (!course) return res.status(404).send('The course with the given ID was not found.')
    res.send(course)
})

app.get('/api/posts/:year/:month', (req , res) => {
    res.send(req.query)
    // params => '/:value'
    // query => '?query'
})

// PORT
const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Listening on port ${port}`))

// export PORT=5000 to set process.env in terminal

// app.post()
// app.put()
// app.delete()
