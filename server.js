import express from 'express'
import http from 'http'
import path from 'path'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

let connectedUsers = 0
const MAX_USERS = 12

//Socket.io handles web socket connections
io.on('connection', (socket)=>{
    if (connectedUsers >= MAX_USERS){
        socket.emit('room full',"The chat room is full. Please try again later")
        socket.disconnect()
        return
    }

    connectedUsers++
    const nickname = `Juror #${connectedUsers}`

    io.emit('message',  `${nickname} has connected`)
    socket.on('user-message', (message) =>{
        console.log(`${nickname} wrote: `, message)
        io.emit("message", message)
    })

    socket.on('disconnect', ()=>{
        console.log(`${nickname} has disconnected`)
        io.emit('message', `${nickname} has disconnected`)
    })
})

//Express handles http requests
app.use(express.static(path.resolve("./public")))

app.get('/', (req, res)=>{
    return res.sendFile('/public/index.html')
})

server.listen(9000, ()=>{
    console.log('Server started at 9000')
})
