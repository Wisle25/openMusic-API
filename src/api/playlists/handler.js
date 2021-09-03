const autoBind = require('auto-bind')

class PlaylistsHandler {
    constructor (service, validator) {
        this._service = service
        this._validator = validator

        autoBind(this)
    }

    async postPlaylistHandler (req, h) {
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
    }

    async getPlaylistsHandler (req) {
        const { id: credentialId } = req.auth.credentials

        const playlists = await this._service.getPlaylists(credentialId)

        return {
            status: 'success',
            data: {
                playlists
            }
        }
    }

    async delPlaylistByIdHandler (req) {
        const { playlistId } = req.params
        const { id: credentialId } = req.auth.credentials

        await this._service.verifyPlaylistOwner(playlistId, credentialId)

        await this._service.delPlaylistById(playlistId)

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus'
        }
    }

    async postSongToPlaylistHandler (req, h) {
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
    }

    async getSongsFromPlaylistHandler (req) {
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
    }

    async delSongFromPlaylistHandler (req) {
        const { id: credentialId } = req.auth.credentials
        const { songId } = req.payload
        const { playlistId } = req.params

        await this._service.verifyPlaylistAccess(playlistId, credentialId)

        await this._service.delSongFromPlaylist(playlistId, songId)

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist.'
        }
    }
}

module.exports = PlaylistsHandler
