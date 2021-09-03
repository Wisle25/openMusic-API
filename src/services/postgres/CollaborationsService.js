const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')

class CollaborationsService {
    constructor (cacheService) {
        this._pool = new Pool()
        this._cacheService = cacheService
    }

    async addCollaboration (payload) {
        await this.verifyNewUserCollaborator(payload.userId)

        const id = `collab-${nanoid(10)}`

        const query = {
            text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
            values: [id, ...Object.values(payload)]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new InvariantError('Gagal menambahkan Kolaborasi.')
        }

        await this._cacheService.delete(`playlist:${payload.credentialId}`)
        return result.rows[0].id
    }

    async delCollaboration (payload) {
        const query = {
            text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
            values: [...Object.values(payload)]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new InvariantError('Gagal menghapus Kolaborasi')
        }

        await this._cacheService.delete(`playlist:${payload.credentialId}`)
    }

    async verifyNewUserCollaborator (userId) {
        const query = {
            text: 'SELECT user_id FROM collaborations WHERE user_id = $1',
            values: [userId]
        }

        const result = await this._pool.query(query)

        if (result.rowCount > 0) {
            throw new InvariantError('Anda sudah menambahkan user tersebut dalam kolaborasi anda.')
        }
    }

    async verifyCollaborator (playlistId, userId) {
        const query = {
            text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId, userId]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new InvariantError('Gagal mem-verifikasi Kolaborasi')
        }
    }
}

module.exports = CollaborationsService
