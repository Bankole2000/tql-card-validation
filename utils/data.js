const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

const lib = {};

lib.baseDir = path.join(__dirname, '/../data/');

// FUNCTION: CREATE: Write data to a new file
lib.create = async (dir, file, data) => {
  return new Promise((resolve, reject) => {
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // Convert data to string
        const stringData = JSON.stringify(data);
        // subFunction: Write to file and close it
        fs.writeFile(fileDescriptor, stringData, (err) => {
          if (!err) {
            fs.close(fileDescriptor, (err) => {
              if (!err) {
                resolve({ err: false })
              } else {
                resolve({ err: "Error closing new file" })
              }
            });
          } else {
            resolve({ err: "Error writing to new file" })
          }
        });
      } else {
        resolve({ err: "Could not create new file, it may already exist" });
      }
    });
  });


};

// FUNCTION: READ: Read data from a file
// lib.read = (dir, file, callback) => {
lib.read = (dir, file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
      if (!err && data) {

        // const parsedData = helpers.parseJsonToObject(data);
        const parsedData = JSON.parse(data);
        resolve({ err: false, data: parsedData })
      } else {

        resolve({ err: "File Not Found", data })
      }
    });
  });
};

// FUNCTION: UPDATE: Update data in a file
lib.update = (dir, file, data) => {
  return new Promise((resolve, reject) => {
    // subFunction: Open/Create the file for writing
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // Convert data to string
        const stringData = JSON.stringify(data);

        // subFunction: truncate the file
        fs.ftruncate(fileDescriptor, (err) => {
          if (!err) {
            // subFunction: Write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
              if (!err) {
                fs.close(fileDescriptor, (err) => {
                  if (!err) {
                    resolve({ err: false });
                  } else {
                    resolve({ err: 'Error closing new file' });
                  }
                });
              } else {
                resolve({ err: 'Error writing to existing file' });
              }
            });
          } else {
            resolve({ err: 'Error truncating the file' });
          }
        });
      } else {
        resolve({ err: 'Could not open the file for update, it may not exist yet' });
      }
    });
  })
};

// FUNCTION: DELETE:
lib.delete = (dir, file) => {
  return new Promise((resolve, reject) => {
    // subFunction: Unlink the file - i.e. Delete
    fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (err) => {
      if (!err) {
        resolve({ err: false });
      } else {
        resolve({ err: 'Error deleting the file' });
      }
    });
  })
};

// FUNCTION: LIST: List all items in a directory
lib.list = (dir, callback) => {
  return new Promise((resolve, reject) => {

    fs.readdir(`${lib.baseDir}${dir}/`, (err, data) => {
      if (!err && data && data.length > 0) {
        const trimmedFileNames = [];
        data.forEach((fileName) => {
          trimmedFileNames.push(fileName.replace('.json', ''));
        });
        resolve({ err: false, trimmedFileNames });
      } else {
        resolve({ err, data });
      }
    });
  })
};

module.exports = lib;
