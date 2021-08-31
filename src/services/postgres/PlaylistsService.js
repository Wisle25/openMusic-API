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
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner]
        }

        const result = await this._pool.query(query)

        if (!result.rows[0].id) {
            throw new InvariantError('Gagal menambahkan playlist!')
        }

        return result.rows[0].id
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

    async addSongtoPlaylist (playlistId, songId) {
        const id = `playlistsong-${nanoid(10)}`

        const query = {
            text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId]
        }

        const result = await this._pool.query(query)

        if (!result.rows[0].id) {
            throw new InvariantError('Gagal menambahkan lagu ke playlist.')
        }

        return result.rows[0].id
    }

    async getSongsFromPlaylist (playlistId) {
        const query = {
            text: `SELECT songs.id, songs.title, songs.performer FROM playlists
            INNER JOIN playlistsongs ON playlistsongs.playlist_id = playlists.id
            INNER JOIN songs ON songs.id = playlistsongs.song_id
            WHERE playlists.id = $1`,
            values: [playlistId]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new InvariantError('Gagal menampilkan lagu pada playlist.')
        }

        return result.rows
    }

    async delSongFromPlaylist (playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new InvariantError('Lagu gagal dihapus dari playlist.')
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

    async verifyPlaylistAccess (playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId)
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err
            }
        }
    }
}

module.exports = PlaylistsService
