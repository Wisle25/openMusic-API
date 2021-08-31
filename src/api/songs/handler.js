const autoBind = require('auto-bind')
const ClientError = require('../../exceptions/ClientError')

class SongsHandler {
    constructor (service, validator) {
        this._service = service
        this._validator = validator

        autoBind(this)
    }

    async postSongHandler (req, h) {
        try {
            await this._validator.validateSongPayload(req.payload)
            const songId = await this._service.addSong(req.payload)

            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan',
                data: {
                    songId
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

    async getSongsHandler () {
        const songs = await this._service.getSongs()
        return {
            status: 'success',
            data: {
                songs
            }
        }
    }

    async getSongByIdHandler (req, h) {
        try {
            const { songId } = req.params
            const song = await this._service.getSongById(songId)

            return {
                status: 'success',
                data: {
                    song
                }
            }
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

    async putSongByIdHandler (req, h) {
        try {
            await this._validator.validateSongPayload(req.payload)

            const { songId } = req.params
            await this._service.editSongById(songId, req.payload)

            return {
                status: 'success',
                message: 'Lagu berhasil diperbarui'
            }
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

    async delSongByIdHandler (req, h) {
        try {
            const { songId } = req.params
            await this._service.delSongById(songId)

            return {
                status: 'success',
                message: 'Lagu berhasil dihapus'
            }
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

module.exports = SongsHandler
