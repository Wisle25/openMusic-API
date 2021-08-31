require('dotenv').config()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')

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

const init = async () => {
    // Reg. Services
    const songsService = new SongsService()
    const usersService = new UsersService()
    const authenticationsService = new AuthenticationsService()
    const playlistsService = new PlaylistsService()

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

    // Reg. Plugin Eksternal
    await server.register([
        {
            plugin: Jwt
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
        }
    ])

    await server.start()
    console.log(`Server is running at ${server.info.uri}`)
}

init()
