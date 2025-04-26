import express from 'express'
import http from 'http'
import path from 'path'
import { Server } from 'socket.io'
import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

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

    //Broadcast current number of online users
    io.emit('update user count', connectedUsers)

    io.emit('message',  `${nickname} has joined the chat`)
    socket.on('user-message', async(message) =>{
        console.log(`${nickname} wrote: `, message)
        io.emit("message", `${nickname}: ${message}`)

        try{
            await pool.query(
                'INSERT INTO messages(sender, content) VALUES($1, $2)',
                [nickname, message]
            )
        } catch(err){
            console.error('Error saving the message to database:', err);
        }
    })

    socket.on('disconnect', ()=>{
        connectedUsers--
        console.log(`${nickname} has disconnected`)
        io.emit('update user count', connectedUsers)
        io.emit('message', `${nickname} has left the chat`)
    })

    socket.on('typing', () =>{
        socket.broadcast.emit('typing', nickname)
    })
})

//Express handles http requests
app.use(express.static(path.resolve("./public")))

app.get('/', (req, res)=>{
    return res.sendFile(path.resolve('/public/index.html'))
})

server.listen(9000, ()=>{
    console.log('Server started at 9000')
})