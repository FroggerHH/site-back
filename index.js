const express = require('express');
const cors = require('cors');
const io = require('@pm2/io')
io.init({
    http: true, https: true, transactions: true
})
const db = require('./fake_db')

const app = express();
const bcrypt = require('bcrypt');

app.use(express.json());
app.use(cors());

app.get('/api/get-products', async (req, res) => {
    const products = await db()[0]()
    console.log(`products: ${products}`)
    res.status(200).json(products)
})
app.post('/api/sign-up', async (req, res) => {
    console.log('Got a sign-up request')
    res.status(200)
})

app.get('/api/sign-in', async (req, res) => {
    console.log('Got a sign-in request')
    res.status(200)
})

app.get('/api', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Documentation</title>
        <style>
            * {
                box-sizing: border-box;
            }
            body {
                font-family: Arial, sans-serif;
                margin: 0;
            }
    
            header {
                text-align: center;
                padding: 20px;
                background-color: #f2f2f2;
            }
    
            h1 {
                color: #333;
            }
    
            section {
                margin-top: 20px;
            }
    
            p {
                line-height: 1.6;
                color: #555;
            }
    
            footer {
                text-align: center;
                color: #888;
            }
    
            html{
                height: 100%;
            }
    
            body{
                height: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-direction: column;
            }
    
            .code{
                background-color: darkgray;
                border-radius: 5px;
                padding: 1px 4px;
            }
        </style>
    </head>
    <body>
    <main>
        <header>
            <h1>API Documentation</h1>
        </header>
        <section>
            <h2>Introduction</h2>
            <p>Welcome to the documentation for our API. This API provides various features for my Telegram bot to work.</p>
        </section>
        <section>
            <h2>Endpoints</h2>
            <p>Our API has the following endpoints:</p>
            <ul>
                <li>/ - GET - Opens this page</li>
                <li>/api - GET - Redirects to <span class="code">/</span> page.</li>
                <li>/api/get-user-photo - GET</li>
                <li>/api/get-products - GET - Returns an array of all products</li>
                <!-- Add more endpoints and descriptions as needed -->
            </ul>
        </section>
    </main>
    <footer>
        &copy; 2023 My Telegram Bot<br>
        To access the API, you should talk to author. Contact me in discord
        <span class="code">@justafrogger</span>
    </footer>
    
    </body>
    </html>
`);
})

const PORT = 8000;
app.listen(PORT, () => console.log('server started on PORT ' + PORT))