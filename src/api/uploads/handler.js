const autoBind = require('auto-bind')

class UploadsHandler {
    constructor (service, validator) {
        this._service = service
        this._validator = validator

        autoBind(this)
    }

    async postUploadImageHandler (req, h) {
        const { data } = req.payload
        this._validator.validateImageHeaders(data.hapi.headers)

        const filename = await this._service.writeFile(data, data.hapi)

        const response = h.response({
            status: 'success',
            message: 'Gambar berhasil diunggah',
            data: {
                pictureUrl: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`
            }
        })
        response.code(201)
        return response
    }
}

module.exports = UploadsHandler
