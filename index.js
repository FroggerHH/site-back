const express = require('express');
const cors = require('cors');
const io = require('@pm2/io')
io.init({
    http: true, https: true, transactions: true
})
const {getProducts, checkUser, registerNewUser, changeUserAvatar, changeUserDisplayName} = require('./fake_db')

const app = express();
const bcrypt = require('bcrypt');

app.use(express.json());
app.use(cors());

app.get('/api/get-products', async (req, res) => {
    const products = getProducts()
    console.log(`products: ${products}`)
    res.status(200).json(products)
})
app.post('/api/sign-up', async (req, res) => {
    console.log('Got a sign-up request', req.body)
    try {
        const {err, result} = registerNewUser(
            {
                username: req.body.username,
                passwordHash: req.body.password,
                email: req.body.email
            }
        )
        if (result === true) {
            res.status(200).json({message: `Successfully registered user ${req.body.username}`})
            console.log(`User ${req.body.username} registered`)
        } else
            res.status(400).json({message: err?.message})
    } catch (err) {
        //"Unknown error"
        console.log(err)
        res.status(500)
    }

    res.status(200)
})

app.post('/api/sign-in', async (req, res) => {
    try {
        const username = req.body.username
        const email = req.body.email
        const password = req.body.password
        const passwordHash = req.body.passwordHash
        const {err, result, user} = checkUser(username, email, password, passwordHash)
        if (result === true) {
            res.status(200).json(user)
            console.log(`User ${username || email} signed in`)
        } else {
            res.status(400).json({message: err?.message})
            console.log(err?.message)
        }

    } catch (err) {
        //"Unknown error"
        console.log(err)
        res.status(500)
    }
})

app.post('/api/set-avatar', (req, res) => {
    console.log('Got a set-avatar request', req.body)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({message: 'No authorization header'})
        console.log(`No authorization header`)
        return
    }
    const auth = authHeader.split(' ');
    try {
        if (auth.length !== 2 || auth[0].toLowerCase() !== 'basic') {
            res.status(401).json({message: 'Invalid authorization header'})
            console.log(`Invalid authorization header`)
            return
        }
        const credentials = Buffer.from(auth[1], 'base64').toString('utf-8');
        const [username, password] = credentials.split(':');
        const {avatarUrl} = req.body
        console.log(`avatarUrl: ${avatarUrl}, username: ${username}, passwordHash: ${password}`)

        const {err, result} = changeUserAvatar(avatarUrl, username, password)
        if (result === true) {
            res.status(200).json({message: `User ${username} avatar changed successfully`})
            console.log(`User ${username} avatar changed successfully`)
        } else  res.status(400).json({message: err?.message})
    } catch (err) {
        console.log(err)
        res.status(400).json({message: err?.message})
    }
})

app.post('/api/set-display-name', (req, res) => {
    console.log('Got a set-display-name request', req.body)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({message: 'No authorization header'})
        console.log(`No authorization header`)
        return
    }
    const auth = authHeader.split(' ');
    try {
        if (auth.length !== 2 || auth[0].toLowerCase() !== 'basic') {
            res.status(401).json({message: 'Invalid authorization header'})
            console.log(`Invalid authorization header`)
            return
        }
        const credentials = Buffer.from(auth[1], 'base64').toString('utf-8');
        const [username, password] = credentials.split(':');
        const {displayName} = req.body
        console.log(`displayName: ${displayName}, username: ${username}, passwordHash: ${password}`)

        const {err, result} = changeUserDisplayName(displayName, username, password)
        if (result === true) {
            res.status(200).json({message: `User ${username} display name changed successfully`})
            console.log(`User ${username} display name changed successfully`)
        } else  res.status(400).json({message: err?.message})
    } catch (err) {
        console.log(err)
        res.status(400).json({message: err?.message})
    }
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