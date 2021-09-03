require('dotenv').config()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')
const path = require('path')

// SONGS
const SongsService = require('./services/postgres/SongsService')
const songs = require('./api/songs')
const SongsValidator = require('./validator/songs')

// USERS
const UsersService = require('./services/postgres/UsersService')
const users = require('./api/users')
const UsersValidator = require('./validator/users')

// AUTHENTICATIONS
const authentications = require('./api/authentications')
const AuthenticationsService = require('./services/postgres/AuthenticationsService')
const TokenManager = require('./tokenize/TokenManager')
const AuthenticationsValidator = require('./validator/authentications')

// PLAYLISTS
const PlaylistsService = require('./services/postgres/PlaylistsService')
const playlists = require('./api/playlists')
const PlaylistsValidator = require('./validator/playlists')

// COLLABORATIONS
const collaborations = require('./api/collaborations')
const CollaborationsService = require('./services/postgres/CollaborationsService')
const CollaborationsValidator = require('./validator/collaborations')

// EXPORTS
const _exports = require('./api/exports')
const producerService = require('./services/rabbitmq/ProducerService')
const ExportsValidator = require('./validator/exports')

// UPLOADS
const uploads = require('./api/uploads')
const StorageService = require('./services/storage/StorageService')
const UploadsValidator = require('./validator/uploads')

// ERROR(S)
const ClientError = require('./exceptions/ClientError')

const init = async () => {
    // Reg. Services
    const songsService = new SongsService()
    const usersService = new UsersService()
    const authenticationsService = new AuthenticationsService()
    const collaborationsService = new CollaborationsService()
    const playlistsService = new PlaylistsService(collaborationsService)
    const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'))

    // Server
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*']
            }
        }
    })

    // ERR Life Cycle Handling
    server.ext('onPreResponse', ({ response }, h) => {
        // Client Error
        if (response instanceof ClientError) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message
            })
            newResponse.code(response.statusCode)
            return newResponse
        }

        // Server error
        if (response instanceof Error) {
            // Missing Authorization
            const { statusCode, payload } = response.output
            if (statusCode === 401) {
                return h.response(payload).code(401)
            }

            // Files too large
            if (statusCode === 413) {
                return h.response(payload).code(413)
            }

            // other errors
            const newResponse = h.response({
                status: 'error',
                message: 'Mohon maaf! Terdapat kesalahan pada server kami'
            })
            newResponse.code(500)
            console.error(response)
            return newResponse
        }

        // Jika tidak terdapat error sama sekali
        return response.continue || response
    })

    // Reg. Plugin Eksternal
    await server.register([
        {
            plugin: Jwt
        },
        {
            plugin: Inert
        }
    ])

    // JWT authentication strategy
    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id
            }
        })
    })

    // Reg. Plugin Internal
    await server.register([
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator
            }
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator
            }
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator
            }
        },
        {
            plugin: playlists,
            options: {
                service: playlistsService,
                validator: PlaylistsValidator
            }
        },
        {
            plugin: collaborations,
            options: {
                collaborationsService,
                playlistsService,
                validator: CollaborationsValidator
            }
        },
        {
            plugin: _exports,
            options: {
                producerService,
                playlistsService,
                validator: ExportsValidator
            }
        },
        {
            plugin: uploads,
            options: {
                service: storageService,
                validator: UploadsValidator
            }
        }
    ])

    await server.start()
    console.log(`Server is running at ${server.info.uri}`)
}

init()
