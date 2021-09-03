
exports.up = pgm => {
    pgm.createTable('collaborations', {
        id: {
            type: 'VARCHAR(30)',
            primaryKey: true
        },
        playlist_id: {
            type: 'VARCHAR(30)',
            notNull: true
        },
        user_id: {
            type: 'VARCHAR(30)',
            notNull: true
        }
    })

    // Added Unique constraint for playlistId and userId
    pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', 'UNIQUE(playlist_id, user_id)')

    // Added Foreign Key to playlistId and userId that references to playlists.id and users.id
    pgm.addConstraint('collaborations', 'fk_collaboration.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
    pgm.addConstraint('collaborations', 'fk_collaboration.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE')
}

exports.down = pgm => {
    pgm.dropTable('collaborations')
}
