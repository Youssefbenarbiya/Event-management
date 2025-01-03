const express = require('express')
const app = express()
require('dotenv').config()
const userRouter = require('./routes/user.routes')
const eventRouter = require('./routes/event.routes')
const ticketRouter = require('./routes/ticket.routes')
const connection = require('./config/db')
app.use(express.json())

const cors = require("cors");

app.use(
  cors({
    origin: ["https://event-dsi31.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get('/', (req,res) => {
    res.json('Welcome to the ticket booking app')
})

app.use('/user',userRouter)
app.use('/event',eventRouter)
app.use('/ticket',ticketRouter)

app.listen(process.env.port, async() => {
    try{
        await connection
        console.log('Connected to the db')
    }catch(err){
        console.log(err.message)
    }
    console.log(`Server is running at port ${process.env.port}`)
})