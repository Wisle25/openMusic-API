const autoBind = require('auto-bind')
const ClientError = require('../../exceptions/ClientError')

class PlaylistsHandler {
    constructor (service, validator) {
        this._service = service
        this._validator = validator

        autoBind(this)
    }

    async postPlaylistHandler (req, h) {
        try {
            await this._validator.validatePostPlaylistPayload(req.payload)

            const { name } = req.payload
            const { id: credentialId } = req.auth.credentials

            const playlistId = await this._service.addPlaylist({ name, owner: credentialId })

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
            const { id: credentialId } = req.auth.credentials

            const playlists = await this._service.getPlaylists(credentialId)

            return {
                status: 'success',
                data: {
                    playlists
                }
            }
        } catch (err) {
            const response = h.response({
                status: 'error',
                message: 'Mohon maaf! Terjad kesalahan pada server kami.'
            })
            response.code(500)
            console.error(err)
            return response
        }
    }

    async delPlaylistByIdHandler (req, h) {
        try {
            const { playlistId } = req.params
            const { id: credentialId } = req.auth.credentials

            await this._service.verifyPlaylistOwner(playlistId, credentialId)

            await this._service.delPlaylistById(playlistId)

            return {
                status: 'success',
                message: 'Playlist berhasil dihapus'
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
                message: 'Mohon maaf! Terjadi kesalahan pada server kami.'
            })
            response.code(500)
            console.error(err)
            return response
        }
    }

    async postSongToPlaylistHandler (req, h) {
        try {
            this._validator.validatePostPlaylistSongPayload(req.payload)

            const { id: credentialId } = req.auth.credentials
            const { playlistId } = req.params
            const { songId } = req.payload

            await this._service.verifyPlaylistAccess(playlistId, credentialId)

            await this._service.addSongtoPlaylist(playlistId, songId)

            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan ke playlist'
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

    async getSongsFromPlaylistHandler (req, h) {
        try {
            const { playlistId } = req.params
            const { id: credentialId } = req.auth.credentials

            await this._service.verifyPlaylistAccess(playlistId, credentialId)

            const songs = await this._service.getSongsFromPlaylist(playlistId)

            return {
                status: 'success',
                data: {
                    songs
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

    async delSongFromPlaylistHandler (req, h) {
        try {
            const { id: credentialId } = req.auth.credentials
            const { songId } = req.payload
            const { playlistId } = req.params

            await this._service.verifyPlaylistAccess(playlistId, credentialId)

            await this._service.delSongFromPlaylist(playlistId, songId)

            return {
                status: 'success',
                message: 'Lagu berhasil dihapus dari playlist.'
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

module.exports = PlaylistsHandler
