var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

mongoose.Promise = Promise;
app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

var dbURI = 'mongodb+srv://Aishu:Aishu@cluster0-exica.mongodb.net/test?retryWrites=true&w=majority'

var Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages',(req, res) => {
    Message.find({}, (err,messages) => {
        res.send(messages)
    })
})

app.post('/messages',(req, res) => {
    var message = new Message(req.body)
    
    message.save()
    .then(() => {
        console.log('saved')
        return Message.findOne({message: 'badword'})
    })
    .then( censored => {
        if(censored){
            console.log('Censored word found', censored)
            return Message.remove({_id: censored.id})
        }
        io.emit('message', req.body)
        res.sendStatus(200)
    })
    .catch((err) => {
        res.sendStatus(500)
        console.error(err)
    })  
})


io.on('connection', (socket) => {
    console.log('User has connected')
})

mongoose.connect(dbURI, 
    {
       useNewUrlParser: true
    }).then(() => console.log('DB connected'))
 
 mongoose.connection.on('error', err => {
    console.log(`DB connection error ${err.message}`);
 });

var server = http.listen(3000, () => {
    console.log('Server is listening on port', server.address().port)
})