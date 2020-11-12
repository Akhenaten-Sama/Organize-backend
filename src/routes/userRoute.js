const express = require('express')
const User = require('../models/usersModel')
const auth = require('../middlewares/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeMail, sendCancellationMail} = require('../email/account')
const router = new express.Router()




const upload = multer({
  
  limits:{
    fileSize:1000000
  },

  fileFilter(req, file, cb){
if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
 return cb(new Error('Only Jpg, png and jpeg are allowed'))
}
return cb(undefined, true)
  }
})



router.get('/users/:id/avatar', async(req, res)=>{
  try {
    const user = await User.findById(req.params.id )
    if(!user|| !user.avatar){
throw new Error()
    }
      res.set('Content-Type', 'image/png')
      res.send(user.avatar)

  } catch (error) {
    res.status(404).send()
  }
})
router.post('/users', async (req, res)=>{
    const user = new User(req.body)
     
    
    
    try {
      const token = await user.generateAuthToken()
        await user.save()
        sendWelcomeMail(user.name, user.email)
        res.status(201).send({user, token})
    } catch (e) {
      res.status(400).send(e)
    }
  })
  
  router.post('/users/me/avatar', auth, upload.single('upload'), async(req,res)=>{
        const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
  }, (error, req, res, next)=>{
        res.status(400).send({error:error.message})
  })


  

  router.post('/users/login', async (req,res)=>{
    try {
      const user = await User.findByCredentials(req.body.email, req.body.password)
     const token = await user.generateAuthToken()
       res.send({user, token})
       

       
      
    } catch (e) {
      console.log(e)
      res.status(400).send(e)
    }
  
  })


  router.post('/users/logout', auth, async(req, res)=>{
    try {
      req.user.tokens =req.user.tokens.filter(obj=> obj.token.token!==req.token)
      await req.user.save()
      res.send()

    } catch (error) {
      res.status(500).send('unable to logout')
    }
  })
  
router.get('/users/me', auth, async (req, res)=>{
  
  res.send(req.user)
      
     
         
      
  })
  
  
 

  router.patch('/users/me',auth,  async(req, res)=>{
    
 const updates = Object.keys(req.body)
 const allowedUpdates = ['name', 'email', 'age', 'password']
 const isValid = updates.every(update=> allowedUpdates.includes(update))
 if (!isValid){
  return res.status(400).send({error:"Invalid Update"})
 }

 

  try {
      updates.forEach(update=> req.user[update]= req.body[update])
      await req.user.save()

   res.send(req.user)

  } catch (error) {
      res.status(500).send(error)
  }
})


router.delete('/users/me', auth, async (req, res)=>{
    
    try {
      await req.user.remove()
      sendCancellationMail(req.user.name, req.user.email)
      res.send(req.user)
    } catch (e) {
      res.status(500).send()
    }


})

router.delete('/users/me/avatar', auth, async(req, res)=>{
  try {
    req.user.avatar = undefined
  await req.user.save()
  res.send()
  } catch (error) {
    res.status(500).send('unable to delete')
  }
})


module.exports = router