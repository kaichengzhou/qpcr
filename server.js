const
    express = require('express'),
    path = require('path'),
    app = express()

const routes = require('./api/routes')

app.use(express.static(path.join(__dirname, '/client')))
app.use(routes())

app.get('/', function(req, res){
   res.send("Hello World!");
});

const host = '0.0.0.0';
const port = process.env.PORT || 80;
app.listen(port, host, () => {
    console.log('Server Running')
})

