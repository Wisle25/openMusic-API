const autoBind = require('auto-bind')
const ClientError = require('../../exceptions/ClientError')

class CollaborationsHandler {
    constructor (collaborationsService, playlistsService, validator) {
        this._collaborationsService = collaborationsService
        this._playlistsService = playlistsService
        this._validator = validator

        autoBind(this)
    }

    async addCollaborationHandler (req, h) {
        try {
            this._validator.validateCollaborationPayload(req.payload)

            const { id: credentialId } = req.auth.credentials
            const { playlistId } = req.payload

            await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)

            const collaborationId = await this._collaborationsService.addCollaboration(req.payload)

            const response = h.response({
                status: 'success',
                message: 'Kolaborasi berhasil ditambahkan',
                data: {
                    collaborationId
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
                message: 'Mohon maaf! Terdapat kesalahan pada server kami'
            })
            response.code(500)
            console.error(err)
            return response
        }
    }

    async delCollaborationHandler (req, h) {
        try {
            this._validator.validateCollaborationPayload(req.payload)

            const { id: credentialId } = req.auth.credentials
            const { playlistId } = req.payload

            await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)

            await this._collaborationsService.delCollaboration(req.payload)

            return {
                status: 'success',
                message: 'Kolaborasi berhasil dihapus.'
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
                message: 'Mohon maaf! Terdapat kesalahan pada server kami'
            })
            response.code(500)
            console.error(err)
            return response
        }
    }
}

module.exports = CollaborationsHandler
