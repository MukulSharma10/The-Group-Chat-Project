import express from 'express'
import http from 'http'
import path from 'path'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

//Socket.io handles socket connection
io.on('connection', (socket)=>{
    socket.on('user-message', (message) =>{
        console.log("A new User message", message)
        io.emit("message", message)
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
