const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const static = require('static')

//Puhelinluettelo Backend

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('build'))
morgan.token('DATA', function (req, res) {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }else{
        return null
    }
})
app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.DATA(req, res)
    ].join(' ')
}))

let persons = [
    {
        name: "Martti Tienari",
        number: "040-123456",
        id: 1
    },
    {
        name: "Arto Järvinen",
        number: "040-123456",
        id: 2
    },
    {
        name: "Arto Häkkinen",
        number: "050-323535345",
        id: 3
    },
    {
        name: "Pekka Salonen",
        number: "09-124847535",
        id: 4
    }
]

app.get('/info/', (req, res) => {
    const date = new Date()
    res.send(`<p>Puhelinluettelossa on ${persons.length} henkilön tiedot</p>
    <p>${date}</p>`)
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})
//Palauttaa id:n mukaisen resurssin, jos se löytyy, muuten 404 not found
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)

    if(person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})
//Poistaa id:n mukaisen resurssin, jos se on olemassa, muuten 404 
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)

    if(person) {//Jos resurssi löytyi, poistetaan se ja vastataan 204
        persons = persons.filter(p => p.id !== id)
        res.status(204).end()
    } else {
        res.status(404).end()
    }    
})
//Lisää tietojen mukaisen resurssin
app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'content missing'
        })
    }

    const found = persons.find(p => p.name === body.name)
    
    if(found) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    generateId = () => {
        // Math.floor(Math.random() * (max-min+1)) + min;
        return Math.floor(Math.random() * 10000);
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)
    res.json(person)
})
/*
app.post('/api/persons', (req, res) => {
    const person = req.body
    console.log(person)
})*/


const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
