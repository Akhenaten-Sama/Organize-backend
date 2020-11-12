const express = require('express')
const auth = require('../middlewares/auth')
const Task = require('../models/tasksModel')
const router = new express.Router()



router.post('/tasks', auth, async(req, res)=>{
    //const userId = new Task(req.body)
  const task = new Task({
    ...req.body,
    owner:req.user._id
  })

    try {
     await task.save()  
      res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }

  })

  router.get('/tasks',auth, async(req, res)=>{


    try {
    let completed;
    let task;
    let limit = parseInt(req.query.limit)
        if(req.query.completed) {
          completed= req.query.completed ==='true'
          task = await Task.find({owner:req.user._id, completed })
          .limit(limit).skip(3)
           }else{
          task= await Task.find({owner:req.user._id })
        }
         
        res.status(201).send(task)
      
      } catch (e) {
        res.status(500).send(e)
      }
    
})
  
  router.get('/tasks/:id', auth, async (req, res)=>{
      const _id = req.params.id
      try {
        const task = await Task.findOne({_id, owner:req.user._id}) 
        !task? res.status(404).send() : res.send(task)
            console.log(task)
      } catch (e) {
        res.status(500).send()
      }


  })


  
  

  router.patch('/tasks/:id',auth, async(req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['desc', 'completed']
    const isValid = updates.every(update=> allowedUpdates.includes(update))
    if (!isValid){
     return res.status(400).send({error:"Invalid Update"})
    }

    try {
     const task = await Task.findOne({_id:req.params.id, owner:req.user._id})
     updates.forEach(update=> task[update]= req.body[update])
     await task.save()
     if(!task){
       return res.status(404).send()
     }

     res.send(task)

    } catch (error) {
        res.status(500).send(error)
    }
  })

  

  router.delete('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id
    try {
      const task = await Task.findOneAndDelete({_id, owner:req.user._id }) 
      if(!task){
        return res.status(404).send()
      }
      res.send(task)

    } catch (e) {
      res.status(500).send()
    }


})


module.exports = router
