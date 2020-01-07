const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage , generateLocation  } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

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
    // socket.broadcast.emit('message','New user is added')

    socket.on('join', ({username, room},callback) => {
        console.log(username)
        const {error, user} = addUser({id: socket.id , username , room})
        console.log(user)
        if(error){
            console.log(error)
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin','Welcomt to '+room))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',username +' Added'))
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(message,callback) => {
        const user = getUser(socket.id)
        console.log(user)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback('Delivered !!!')
    })


    socket.emit('message',{
        username : 'Admin',
        text : "Welcome",
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
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',user.username+' left'))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }
    })
    socket.on('shareLocation', (location,callback) => {
        const user = getUser(socket.id)
        const googleMapUrl = 'https://google.com/maps?q='+location.latitude+','+location.longitude
       // const locationMessage = 'Location : '+location.latitude +',' +location.longitude + 'and you can get location here : '+googleMapUrl
        io.to(user.room).emit('locationMessage',generateLocation(user.username,googleMapUrl))
        callback()
    })
})




server.listen(port,() => {
    console.log('Server running at port : ',port)
})
