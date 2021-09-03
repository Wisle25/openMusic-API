const autoBind = require('auto-bind')

class ExportsHandler {
    constructor (producerService, playlistsService, validator) {
        this._service = producerService
        this._playlistsService = playlistsService
        this._validator = validator

        autoBind(this)
    }

    async postExportPlaylistHandler (req, h) {
        this._validator.validateExportPlaylistPayload(req.payload)

        const { playlistId } = req.params
        const { id: credentialId } = req.auth.credentials

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)

        const message = {
            playlistId,
            userId: credentialId,
            targetEmail: req.payload.targetEmail
        }

        await this._service.sendMessage('export:playlists', JSON.stringify(message))

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses'
        })
        response.code(201)
        return response
    }
}

module.exports = ExportsHandler
