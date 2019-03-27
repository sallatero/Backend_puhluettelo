require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const static = require('static')
const Person = require('./models/person')

//Puhelinluettelo Backend

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(cors())

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

/*
app.get('/info/', (req, res) => {
    const date = new Date()
    Person.countDocuments({}, (err, count) => {
        res.send(`<p>Puhelinluettelossa on ${count} henkilön tiedot</p>
        <p>${date}</p>`)
    })
})
*/
app.get('/api/persons', (req, res) => {
    //res.json(persons)
    Person.find({})
    .then(all => {
        console.log('ihmiset löytyivät')
        res.json(all.map(p => p.toJSON()))
    })
    .catch(error => {
        console.log(error)
        next(error)
    })
})

//Palauttaa id:n mukaisen resurssin, jos se löytyy, muuten 404 not found
app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
    .then(pers => {
        if (pers) {
            console.log(`Tyyppi id:llä ${req.params.id} löytyi`);
            res.json(pers.toJSON())
        } else {
            res.status(204).end()
        }
    })
    .catch(error => {
        console.log(error)
        next(error)
    })
})

//Poistaa id:n mukaisen resurssin, jos se on olemassa, muuten 404 
app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndRemove(req.params.id)
        .then(person => {
            if (person) {
                console.log('tietokannasta löytyi id:llä ', req.params.id);
                res.status(204).end()
            } else {
                res.status(204).end()
            }
        })
       .catch(error => {
            console.log('Error in delete')
            next(error)
        })
})

//Lisää tietojen mukaisen resurssin
app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        res.status(400).json({ //res.json->FINISHED
            error: 'content missing'
        })
    }

    //Tarkistaa onko nimi jo tietokannassa
    /*
    Person.find({name: body.name}).then(found => {
        if (found !== undefined) { //Ei toimi! found on []
            return res.status(400).json({ //res.json->FINISHED
                error: 'name must be unique'
            })
        }
    })
    */
  
    generateId = () => {
        return Math.floor(Math.random() * 10000);
    }

    const newPerson = new Person({
        name: body.name,
        number: body.number,
        id: generateId()
    })
    newPerson.save()
    .then(savedP => {
        const jsonP = savedP.toJSON()
        res.status(200).json(jsonP)
    })
    .catch(error => {
        console.log(error)
        next(error)
    })
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const pers = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(req.params.id, pers, {new:true})
    .then(updatedPers => {
        res.json(updatedPers.toJSON())
    })
    .catch(error => next(error))
})


//Unknown endpoint
//ota käyttöön

//Error handler
const errorHandler = (error, req, res, next) => {
    console.log(error.message)
    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return res.status(400).send({error: 'malformatted id'})
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
