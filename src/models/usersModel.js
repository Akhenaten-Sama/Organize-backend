const mongoose = require('mongoose')
const validator = require ('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./tasksModel')





const userSchema = new mongoose.Schema( {
    name:{ 
    type: String,
    trim:true},
    age:{ type: Number,
    default:0},
    email:{type:String,
        trim:true,
        unique:true,
        required:true,
    validate(value){
    if(!validator.isEmail(value))
    throw new Error('Email is not Valid Dear')
    }},
    password:{
        type:String,
        minlength:7,
        trim:true,
        required:true,
        validate(value){
            if(validator.contains(value, 'password', {ignoreCase:true})){
                throw new Error('password must not be password')
            }
        }

    },

    tokens:[{

        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},
{
    timestamps:true
})


userSchema.methods.generateAuthToken = async function () {
    user = this
     
     token = jwt.sign({_id:user._id.toString()}, process.env.JWT)
     user.tokens = user.tokens.concat({token})
     await user.save()
     return token
}

userSchema.methods.toJSON =  function(){
user = this
const userObject = user.toObject()

delete userObject.avatar
delete userObject.tokens
delete userObject.password


return userObject

}


userSchema.virtual('tasks', {
    localField:'_id',
    foreignField:'owner',
    ref:'Task'
})
userSchema.statics.findByCredentials = async(email, password)=>{

     const user = await User.findOne({email})
     if(!user){
         throw new Error('unable to login')
     }

     const isMatch = await bcrypt.compare(password, user.password)
     console.log(isMatch)
     if(!isMatch){
         throw new Error ('unable to login')
     }
     return user
}
userSchema.pre('save', async function(next){
    const user = this
    if (user.isModified('password')){
      user.password = await bcrypt.hash(user.password, 8)
    }

   next()
})

userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner:user._id})

    next()
})
const User = mongoose.model('user', userSchema)

module.exports = User