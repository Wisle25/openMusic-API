
exports.up = pgm => {
    pgm.createTable('users', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true
        },
        username: {
            type: 'VARCHAR(20)',
            unique: true,
            notNull: true
        },
        password: {
            type: 'TEXT',
            notNull: true
        },
        fullname: {
            type: 'TEXT',
            notNull: true
        }
    })
};

exports.down = pgm => {
    pgm.dropTable('users')
};
