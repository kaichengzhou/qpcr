const
    express = require('express'),
    router = express.Router(),
    superagent = require('superagent'),
    path = require('path')

module.exports = () => {

    router.get('/api/', (req, res) => {
       
                res.json({ error: 'message' })

    })

    router.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/index.html'))
    })

    return router
}