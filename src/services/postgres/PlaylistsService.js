const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const AuthorizationError = require('../../exceptions/AuthorizationError')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class PlaylistsService {
    constructor () {
        this._pool = new Pool()
    }

    async addPlaylist ({ name, owner }) {
        const id = `playlist-${nanoid(16)}`

        const query = {
            text: 'INSERT INTO playlist VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner]
        }

        const result = await this._pool.query(query)

        if (!result.rows[0].id) {
            throw new InvariantError('Gagal menambahkan playlist!')
        }

        return id
    }

    async getPlaylists ({ userId }) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists
            INNER JOIN users ON playlists.owner = users.id
            WHERE playlists.owner = $1`,
            values: [userId]
        }

        const result = await this._pool.query(query)
        return result.rows
    }

    async delPlaylist ({ playlistId }) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [playlistId]
        }
        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
        }
    }

    async verifyPlaylistOwner (playlistId, userId) {
        const query = {
            text: 'SELECT owner FROM playlists WHERE id = $1',
            values: [playlistId]
        }

        const result = await this._pool.query(query)

        if (result.rows[0].owner !== userId) {
            throw new AuthorizationError('Anda tidak berhak untuk mengakses playlist ini!')
        }
    }
}

module.exports = PlaylistsService
