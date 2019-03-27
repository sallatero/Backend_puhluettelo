const mongoose = require('mongoose')

//process.argv on taulukko, jossa käynnistyksessä annetut parametrit
//indeksit 0-1 on polkuja ja esim salasana on indeksillä 2.
/*if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}
const password = process.argv[2]
*/

mongoose.set('useFindAndModify', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url);

mongoose.connect(url, {useNewUrlParser: true})
.then(res => {
    console.log('connected to MongoDB');
})
.catch((error) => {
    console.log('error connecting to MongoDB: ', error.message);
})

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

    //Määritellään skeemalle "funktio" toJSON, joka muokkaa 
//tietokannasta tulevaa dokumenttia haluamaamme muotoon
personSchema.set('toJSON', {
    transform: (doc, returnedObj) => {
        returnedObj.id = returnedObj._id.toString()
        delete returnedObj._id
        delete returnedObj.__v
    }
})

module.exports = mongoose.model('Person', personSchema)