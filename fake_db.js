const bcrypt = require('bcrypt')
const fs = require('fs');

function db() {
    let DB_data = {
        products: [{
            productId: '1', title: '', description: '', price: '', image: ''
        }], users: [
            {
                username: '',
                displayName: '',
                email: '',
                passwordHash: '',
                isAdmin: false,
                avatarUrl: ''
            }
        ]
    };

    const getProducts = () => {
        return DB_data.products
    }

    const addProduct = (newProduct) => {
        return DB_data.products.push(newProduct)
    }

    const addUser = (newUser) => {
        DB_data.users.push(newUser)
        newUser.userId = DB_data.users.length
        updateFile()
    }

    const overwriteProduct = (id, newProduct) => {
        DB_data.products[id] = newProduct
    }

    const changeUserAvatar = (avatarUrl, username, passwordHash) => {
        const {err, result, user} = checkUser(username, undefined, undefined, passwordHash)
        if (result === false) return {err: err, result: false}
        if (avatarUrl === undefined || avatarUrl.length < 1) return {err: new Error('No avatarUrl'), result: false}
        if (avatarUrl.includes(' ') || (!avatarUrl.includes('https://') && !avatarUrl.includes('http://'))) return {
            err: new Error('Invalid avatarUrl'),
            result: false
        }
        user.avatarUrl = avatarUrl
        updateFile()
        return {err: null, result: true}
    }
    const changeUserDisplayName = (displayName, username, passwordHash) => {
        const {err, result, user} = checkUser(username, undefined, undefined, passwordHash)
        if (result === false) return {err: err, result: false}
        if (displayName === undefined || displayName.length < 1) return {
            err: new Error('No new displayName'),
            result: false
        }
        if (displayName.includes('@') || displayName.includes('#') ||
            displayName.includes('$') || displayName.includes('%') || displayName.includes('^') ||
            displayName.includes('&') || displayName.includes('*') || displayName.includes('(') || displayName.includes(')') ||
            displayName.includes('[') || displayName.includes(']') || displayName.includes('{') || displayName.includes('}') ||
            displayName.includes('<') || displayName.includes('>') || displayName.includes('?') || displayName.includes('/') ||
            displayName.includes('\\') || displayName.includes('|') || displayName.includes('\'') || displayName.includes('"') ||
            displayName.startsWith(' ') || displayName.endsWith(' ')
        ) return {
            err: new Error('Invalid new displayName'),
            result: false
        }
        if (displayName === user.username) delete user.displayName
        else user.displayName = displayName
        updateFile()
        return {err: null, result: true}
    }

    const findUser = (username) => {
        return DB_data.users.find(user => user.username === username)
    }
    const findUserEmail = (username, email) => {
        return DB_data.users.find(user => user.email === email || user.username === username)
    }

    const checkUser = (username, email, password, passwordHash) => {
        if (username === undefined && email === undefined) return {
            err: new Error(`UsernameError: No username or email. username: ${username}, email: ${email}`), result: false
        }
        if ((password === undefined && passwordHash === undefined) || (password === null && passwordHash === null)) return {
            err: new Error('PasswordError:No password'), result: false
        }
        if ((password !== undefined && password !== null && password.length < 1) || (passwordHash !== undefined && passwordHash !== null && passwordHash.length < 1)) return {
            err: new Error('PasswordError: No password'),
            result: false
        }
        const foundUser = findUserEmail(username, email)
        if (foundUser !== undefined && foundUser !== null) {
            let passwordMatch = false
            if (passwordHash !== undefined) passwordMatch = passwordHash === foundUser.passwordHash
            else passwordMatch = bcrypt.compareSync(password, foundUser.passwordHash)
            if (passwordMatch) return {err: null, result: true, user: foundUser};
            else return {err: new Error('PasswordError: Wrong password'), result: false}
        } else return {err: new Error('UsernameError: User not found'), result: false}
    }

    const registerNewUser = (newUser) => {
        if (newUser.username === undefined || newUser.username.length < 1) return {
            err: new Error('UsernameError: No username'), result: false
        }
        if (newUser.username.includes(' ')) return {
            err: new Error('UsernameError: username cannot contain spaces'), result: false
        }
        if (newUser.username.length < 5) return {
            err: new Error('UsernameError: username too short'), result: false
        }
        if (newUser.email === undefined || newUser.email.length < 1 || !newUser.email.includes('@')) return {
            err: new Error('EmailError: No email'), result: false
        }
        if (newUser.email.length < 5) return {
            err: new Error('EmailError: Email too short'), result: false
        }
        if (newUser.email.includes(' ')) return {
            err: new Error('EmailError: Email cannot contain spaces'), result: false
        }
        if (newUser.passwordHash === undefined || newUser.passwordHash.length < 1) return {
            err: new Error('PasswordError: No password'), result: false
        }
        if (newUser.passwordHash.length < 8) return {
            err: new Error('PasswordError: Password too short'), result: false
        }
        if (newUser.passwordHash.includes(' ')) return {
            err: new Error('PasswordError: Password cannot contain spaces'), result: false
        }
        const foundUser = findUserEmail(newUser.username, newUser.email)
        if (foundUser !== undefined && foundUser !== null) return {
            err: new Error('UsernameError: User already exists'), result: false
        }

        newUser.passwordHash = bcrypt.hashSync(newUser.passwordHash, 10)
        addUser(newUser)

        return {err: null, result: true}
    }

    const loadDataFromFile = () => {
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
            } else {
                console.log('File exists. Loading data...')
                DB_data = JSON.parse(data.toString())
                console.log('Data loaded')
            }
        })
    }

    const updateFile = () => {
        fs.writeFile('db.json', JSON.stringify(DB_data, null, 4), (err) => {
            if (err) {
                console.log(err)
            }
        })
    }

    loadDataFromFile()


    return {
        getProducts,
        addProduct,
        registerNewUser,
        overwriteProduct,
        changeUserAvatar,
        changeUserDisplayName,
        checkUser
    }
}

module.exports = db()