const express = require('express')
const userRouter = require('./routes/userRoute')
const taskRouter = require('./routes/taskRoute')
const User = require('./models/usersModel')
require('./db/mongoose')

const app = express()
const port = process.env.PORT

// app.use((req, res, next)=>{

//    if(req.method === 'GET'){
//        res.send('Get request is disabled')
//    } else{
//      next()
//    }
   
//})

// app.use((req, res, next)=>{
//    res.status(503).send('site currently under maintenance')
// })



app.use(express.json())
app.use(userRouter)
app.use(taskRouter)




app.listen(port, ()=>{
    console.log(`server has started on ${port} already guy`)
})

