const path = require('path');
const multer = require('multer');
let PATH = __dirname + '\\uploads';

let storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        console.log(PATH);
        cb(null, PATH);
    },
    filename:(req, file, cb) => {
        cb(null, file.originalname)
    }
});

let upload = multer({
    storage: storage,
});


module.exports = { 
    upload : upload,
    PATH: PATH
} 