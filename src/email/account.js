const mail = require('@sendgrid/mail')

mail.setApiKey(process.env.SENDGRIDAPI)


const sendWelcomeMail =(name, email)=>{

mail.send({
    from:'oluwaseunefunkunle10@gmail.com',
    to:email,
    subject:'Thanks For Joining Us!',
    text: `Welcome aboard ${name}. Glad you joined us. Hope you enjoy the service.`
})
}

const sendCancellationMail = (name, email)=>{
    mail.send({
        from:'oluwaseunefunkunle10@gmail.com',
        to:email,
        subject:'Thanks For Joining Us!',
        text: `Sad to see you go ${name}. Aanything we could have done differently?.`
    })
}


module.exports ={
    sendWelcomeMail,
    sendCancellationMail
}