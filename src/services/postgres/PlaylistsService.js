const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const AuthorizationError = require('../../exceptions/AuthorizationError')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class PlaylistsService {
    constructor (collaborationsService, cacheService) {
        this._pool = new Pool()
        this._collaborationsService = collaborationsService
        this._cacheService = cacheService
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

        await this._cacheService.delete(`playlists:${owner}`)
        return result.rows[0].id
    }

    async getPlaylists (userId) {
        try {
            const result = await this._cacheService.get(`playlists:${userId}`)
            return JSON.parse(result)
        } catch (err) {
            const query = {
                text: `SELECT playlists.id, playlists.name, users.username FROM playlists
                INNER JOIN users ON playlists.owner = users.id
                LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
                WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
                values: [userId]
            }

            const result = await this._pool.query(query)

            await this._cacheService.set(`playlists:${userId}`, JSON.stringify(result.rows))
            return result.rows
        }
    }

    async delPlaylistById (playlistId) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id, owner',
            values: [playlistId]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
        }

        const { owner } = result.rows[0]
        await this._cacheService.delete(`playlists:${owner}`)
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

        await this._cacheService.delete(`songs:${playlistId}`)
        return result.rows[0].id
    }

    async getSongsFromPlaylist (playlistId) {
        try {
            const result = await this._cacheService.get(`songs:${playlistId}`)
            return JSON.parse(result)
        } catch (err) {
            const query = {
                text: `SELECT songs.id, songs.title, songs.performer FROM playlists
                INNER JOIN playlistsongs ON playlistsongs.playlist_id = playlists.id
                INNER JOIN songs ON songs.id = playlistsongs.song_id
                WHERE playlists.id = $1`,
                values: [playlistId]
            }

            const result = await this._pool.query(query)

            await this._cacheService.set(`songs:${playlistId}`, JSON.stringify(result.rows))

            return result.rows
        }
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

        await this._cacheService.delete(`songs:${playlistId}`)
    }

    async verifyPlaylistOwner (playlistId, userId) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [playlistId]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        const playlist = result.rows[0]

        if (playlist.owner !== userId) {
            throw new AuthorizationError('Woops! Anda bukan owner/collaborator di resource ini')
        }
    }

    async verifyPlaylistAccess (playlistId, userId) {
        try {
          await this.verifyPlaylistOwner(playlistId, userId)
        } catch (err) {
          if (err instanceof NotFoundError) {
            throw err
          }
          try {
            await this._collaborationsService.verifyCollaborator(playlistId, userId)
          } catch {
            throw err
          }
        }
    }
}

module.exports = PlaylistsService
