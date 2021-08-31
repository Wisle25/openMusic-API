const InvariantError = require('../../exceptions/InvariantError')
const { PutAuthenticationPayloadSchema, PostAuthenticationPayloadSchema, DelAuthenticationPayloadSchema } = require('./schema')

const AuthenticationsValidator = {
    validatePostAuthenticationPayload: (payload) => {
        const validationResult = PostAuthenticationPayloadSchema.validate(payload)

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },

    validatePutAuthenticationPayload: (payload) => {
        const validationResult = PutAuthenticationPayloadSchema.validate(payload)

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },

    validateDelAuthenticationPayload: (payload) => {
        const validationResult = DelAuthenticationPayloadSchema.validate(payload)

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = AuthenticationsValidator
