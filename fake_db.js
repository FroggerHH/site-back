const bcrypt = require('bcrypt')
const fs = require('fs');
let DB_data = null;

function getProducts() { return DB_data.products }

function loadDataFromFile() {
    fs.readFile('db.json', (err, data) => {
        if (err !== undefined && err !== null && err.code === 'ENOENT') {
            console.log('File does not exist. Creating new one...')
            fs.readFile('exampleData.json', (err, exampleData) => {
                exampleData = exampleData.toString()

                fs.writeFile('db.json', exampleData, (err) => {
                    if (err) {
                        console.log(err)
                    }
                })
                DB_data = JSON.parse(exampleData)
            })
        }
        else {
            console.log('File exists. Loading data...')
            DB_data = JSON.parse(data.toString())
            console.log('Data loaded')
        }
    })
}

loadDataFromFile()


function db(){
    return [
        getProducts
    ]

}

module.exports = db