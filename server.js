import express from 'express'
import http from 'http'
import path from 'path'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

//Socket.io handles web socket connections
io.on('connection', (socket)=>{
    console.log('A user connected!')
    io.emit('message', 'A user has connected')
    socket.on('user-message', (message) =>{
        console.log("A new User message", message)
        io.emit("message", message)
    })

    socket.on('disconnect', ()=>{
        console.log("A user disconnected")
        io.emit('message', 'A user has disconnected')
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
