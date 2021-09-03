const Joi = require('joi')

const UsersPayloadSchema = Joi.object({
    username: Joi.string().max(20).required(),
    password: Joi.string().required(),
    fullname: Joi.string().required()
})

module.exports = { UsersPayloadSchema }
