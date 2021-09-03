const autoBind = require('auto-bind')

class CollaborationsHandler {
    constructor (collaborationsService, playlistsService, validator) {
        this._collaborationsService = collaborationsService
        this._playlistsService = playlistsService
        this._validator = validator

        autoBind(this)
    }

    async addCollaborationHandler (req, h) {
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
    }

    async delCollaborationHandler (req) {
        this._validator.validateCollaborationPayload(req.payload)

        const { id: credentialId } = req.auth.credentials
        const { playlistId } = req.payload

        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)

        await this._collaborationsService.delCollaboration(req.payload)

        return {
            status: 'success',
            message: 'Kolaborasi berhasil dihapus.'
        }
    }
}

module.exports = CollaborationsHandler
