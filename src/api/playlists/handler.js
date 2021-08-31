const ClientError = require('../../exceptions/ClientError')

class PlaylistsHandler {
    constructor (playlistsService, validator) {
        this._playlistsService = playlistsService
        this._validator = validator

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this)
    }

    async postPlaylistHandler (req, h) {
        try {
            await this._validator.validatePostPlaylistPayload(req.payload)

            const { name } = req.payload
            const { id: owner } = req.auth.credentials

            const playlistId = await this._playlistsServiceaddPlaylist({ name, owner })

            const response = h.response({
                status: 'success',
                message: 'Playlist berhasil ditambahkan',
                data: {
                    playlistId
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
                response.code(err.message)
                return response
            }

            const response = h.response({
                status: 'error',
                message: 'Mohon maaf! Terjadi kesalahan pada server kami.'
            })
            response.code(500)
            console.error(err)
            return response
        }
    }

    async getPlaylistsHandler (req, h) {
        try {
            const { id: userId } = req.auth.credentials
            const playlists = await this._playlistsService.getPlaylists({ userId })

            return {
                status: 'success',
                data: {
                    playlists
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
        }
    }
}

module.exports = PlaylistsHandler
