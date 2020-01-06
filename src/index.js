const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage , generateLocation  } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

let count = 0
const message = "Welcome to chat app"

io.on('connection', (socket) => {
    console.log('New websocket connection')
    // socket.emit('message', generateMessage())
    socket.broadcast.emit('message','New user is added',)

    socket.on('sendMessage',(message,callback) => {
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.emit('message', generateMessage(message))
        callback('Delivered !!!')
    })


    socket.emit('message',{
        text : message,
        createdAt: new Date().getTime()
    })

    socket.emit('countUpdated',count)
    socket.on('increment',() => {
        count++
        //socket.emit('countUpdated',count)
        io.emit('countUpdated',count)
    })

    // socket.on('sendMessage', (message) => {
    //     io.emit('message',message)    
    // })

    socket.on('disconnect',() => {
        io.emit('message','User left')
    })
    socket.on('shareLocation', (location,callback) => {
        const googleMapUrl = 'https://google.com/maps?q='+location.latitude+','+location.longitude
       // const locationMessage = 'Location : '+location.latitude +',' +location.longitude + 'and you can get location here : '+googleMapUrl
        io.emit('locationMessage',generateLocation(googleMapUrl))
        callback()
    })
})




server.listen(port,() => {
    console.log('Server running at port : ',port)
})
