const redis = require('redis')

class CacheService {
    constructor () {
        this._client = redis.createClient({
            host: process.env.REDIS_SERVER
        })

        this._client.on('error', (err) => {
            console.error(err)
        })
    }

    set (key, value, expirationInSecond = 3600) {
        return new Promise((resolve, reject) => {
            this._client.set(key, value, 'EX', expirationInSecond, (err, ok) => {
                if (err) {
                    return reject(err)
                }

                return resolve(ok)
            })
        })
    }

    get (key) {
        return new Promise((resolve, reject) => {
            this._client.get(key, (err, reply) => {
                if (err) {
                    return reject(err)
                }

                if (reply === null) {
                    return reject(new Error('Chace tidak ditemukan'))
                }

                return resolve(reply.toString())
            })
        })
    }

    delete (key) {
        return new Promise((resolve, reject) => {
            this._client.del(key, (err, count) => {
                if (err) {
                    return reject(err)
                }

                return resolve(count)
            })
        })
    }
}

module.exports = CacheService
