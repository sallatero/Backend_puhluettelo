const mongoose = require('mongoose')


//process.argv on taulukko, jossa käynnistyksessä annetut parametrit
//indeksit 0-1 on polkuja ja esim salasana on indeksillä 2.
if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = 
    `mongodb+srv://fullstack:${password}@cluster0-epvqk.mongodb.net/puhelinluettelo?retryWrites=true`

mongoose.connect(url, {useNewUrlParser: true})

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

//Jos annettu vain yksi komentoriviparametri
//Hakee kaikki ihmiset
if (process.argv.length === 3) {
    console.log('Puhelinluettelo:')
    Person.find({}).then(res => {
        res.forEach(p => {
            console.log(p.name, p.number);
        })
        mongoose.connection.close()
    })
}

//Jos annettu kolme komentoriviparametria
//Luo uuden ihmisen
if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })

    person.save().then(resp => {
        console.log(`Lisätään ${person.name} numero ${person.number} luetteloon`)
        mongoose.connection.close()
    })
}