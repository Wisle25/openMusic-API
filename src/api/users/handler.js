const ClientError = require('../../exceptions/ClientError')

class UsersHandler {
    constructor (service, validator) {
        this._service = service
        this._validator = validator

        this.regUserHandler = this.regUserHandler.bind(this)
    }

    async regUserHandler (req, h) {
        try {
            await this._validator.validateUserPayload(req.payload)

            const { username, password, fullname } = req.payload
            const userId = await this._service.addUser({ username, password, fullname })

            const response = h.response({
                status: 'success',
                message: 'User berhasil ditambahkan',
                data: {
                    userId
                }
            })
            response.code(201)
            return response
        } catch (err) {
            if (err instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: err.message
                })
                response.code(err.statusCode)
                return response
            }

            const response = h.response({
                status: 'error',
                message: 'Mohon maaf! Terdapat kesalahan pada server kami.'
            })
            response.code(500)
            console.error(err)
            return response
        }
    }
}

module.exports = UsersHandler
