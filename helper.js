const fs = require('fs')

function fileExistsAsync (path) {
  return new Promise((resolve) => {
    fs.stat(path, (err) => {
      resolve(err === null)
    })
  })
}

function readFileAsJsonAsync (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) return reject(err)

      return resolve(JSON.parse(data))
    })
  })
}

module.exports = {
  fileExistsAsync,
  readFileAsJsonAsync
}
