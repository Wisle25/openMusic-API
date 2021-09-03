const autoBind = require('auto-bind')

class SongsHandler {
    constructor (service, validator) {
        this._service = service
        this._validator = validator

        autoBind(this)
    }

    async postSongHandler ({ payload }, h) {
        await this._validator.validateSongPayload(payload)
        const songId = await this._service.addSong(payload)

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan',
            data: {
                songId
            }
        })
        response.code(201)
        return response
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

    async getSongByIdHandler (req) {
        const { songId } = req.params
        const song = await this._service.getSongById(songId)

        return {
            status: 'success',
            data: {
                song
            }
        }
    }

    async putSongByIdHandler (req) {
        await this._validator.validateSongPayload(req.payload)

        const { songId } = req.params
        await this._service.editSongById(songId, req.payload)

        return {
            status: 'success',
            message: 'Lagu berhasil diperbarui'
        }
    }

    async delSongByIdHandler (req) {
        const { songId } = req.params
        await this._service.delSongById(songId)

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus'
        }
    }
}

module.exports = SongsHandler
