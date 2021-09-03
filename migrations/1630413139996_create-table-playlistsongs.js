
exports.up = pgm => {
    pgm.createTable('playlistsongs', {
        id: {
            type: 'VARCHAR(30)',
            primaryKey: true
        },
        playlist_id: {
            type: 'VARCHAR(30)',
            notNull: true
        },
        song_id: {
            type: 'VARCHAR(30)',
            notNull: true
        }
    })

    // Foreign Key on playlist_id
    pgm.addConstraint('playlistsongs', 'fk_playlistsongs.playlist_id_playlist,id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')

    // Foreign Key on song_id
    pgm.addConstraint('playlistsongs', 'fk_playlistsongs.song_id_song.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE')
}

exports.down = pgm => {
    pgm.dropTable('playlistsongs')
}
