const fs = require('fs')
const { nanoid } = require('nanoid')

class StorageService {
    constructor (folder) {
        this._folder = folder

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true })
        }
    }

    writeFile (file, meta) {
        const filename = `${nanoid(5)}-${meta.filename}`
        const path = `${this._folder}/${filename}`

        const fileStream = fs.createWriteStream(path)

        return new Promise((resolve, reject) => {
            fileStream.on('error', (err) => reject(err))
            file.pipe(fileStream)
            file.on('end', () => resolve(filename))
        })
    }
}

module.exports = StorageService
