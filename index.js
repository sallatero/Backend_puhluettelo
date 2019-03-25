require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const static = require('static')
const Person = require('./models/person')

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
        console.log('res.json rivi 46');
        res.json(all.map(p => p.toJSON()))
        return
    })
    .catch(error => {
        console.log(error)
        console.log('res.status(404).end rivi 52');
        res.status(404).end()
    })
})

//Palauttaa id:n mukaisen resurssin, jos se löytyy, muuten 404 not found
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    
    Person.find({id: id})
    .then(pers => {
        console.log('res.json rivi 63');
        res.json(pers.toJSON())
        return
    })
    .catch(error => {
        console.log(error)
        console.log('res.status(404).end rivi 69');
        res.status(404).end()
    })
})

//Poistaa id:n mukaisen resurssin, jos se on olemassa, muuten 404 
/*
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    //const person = persons.find(p => p.id === id)
    Person.findById(req.params.id)
        .then(pers => {
            console.log('tietokannasta löytyi id:llä ', id);
            res.json(pers.toJSON())
        })
        
       .catch(error => {
            console.log(error)
            res.status(404).end()
        })
})
*/

//Lisää tietojen mukaisen resurssin
app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        console.log('res.status(400).json rivi 97');
        return res.status(400).json({ //res.json->FINISHED
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
        console.log('res.status(200).json rivi 124');
        res.status(200).json(jsonP)
        return
    })
    .catch(error => {
        console.log(error)
        console.log('res.status(404) rivi 133');
        return res.status(404)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
