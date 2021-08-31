const routes = (handler) => [
    {
        method: 'POST',
        path: '/users',
        handler: handler.regUserHandler
    }
]

module.exports = routes
