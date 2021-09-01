const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')

class CollaborationsService {
    constructor () {
        this._pool = new Pool()
    }

    async addCollaboration (payload) {
        const id = `collab-${nanoid(10)}`

        const query = {
            text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
            values: [id, ...Object.values(payload)]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new InvariantError('Gagal menambahkan Kolaborasi.')
        }

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
