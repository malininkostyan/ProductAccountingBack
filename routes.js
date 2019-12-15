//cd C:\"Program Files"\PostgreSQL\11\bin
//pg_ctl -D /"Program Files"/PostgreSQL/11/data start

let jwt = require('jsonwebtoken');
const secretKey = "myTestSecretKey";
const fileLoad = require('./files');
const path = require('path');
const fs = require('fs');


module.exports = function(app, db) {
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:4200");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Athorization");
        if (['/category', '/category/create', '/category/update', '/category/delete'].includes(req.originalUrl)) {
            let object = convertToObj(req.body);
            if (req.originalUrl === '/category' && object.pageName !== "admin") {
                return next();
            }
            jwt.verify(object.token, secretKey, async function(err, decoded) {
                if (err) return res.send(false);
                if (!decoded.isAdmin) return res.send(false);
                next();
            });
        }
        else {
            next();
        }
    });
    
    app.get('/testdb', async (req, res) => {
        res.send(`DB url ${process.env.DATABASE_URL}`);
    });

    app.post('/category', async (req, res) => {       
        /*let products = await db.Models.Product.findAll();
        res.send(products);
*/
        let object = convertToObj(req.body);
        object = object.data;   
        if (object == null || object.findText == null) object = {findText: ''};
        let products = await db.sequelize.query(`SELECT * FROM searchInProducts('${object.findText}');`);
        console.log("findtext");
        console.log(req.body);
        console.log(object.data);
        console.log(object.findText);
        res.send(products[0]);
    });

    app.post('/login', async (req, res) => {
        let object = convertToObj(req.body);
        let user = await db.Models.User.findOne({
            where: {
                login: object.login,
                password: object.password
            }
        });
        if (user != null) {
            let token = jwt.sign({ login: object.login, isAdmin: user.isAdmin }, secretKey);
            res.send({
                login: user.login,
                isAdmin: user.isAdmin,
                token: token
            });
        }
        else {
            res.send(false);
        } 
    });

    app.post('/category/create', async (req, res) => {
        let object = convertToObj(req.body);
        object = object.data;
        if (object.category == null || object.price == null || object.description == null || object.url == null) return res.send(false);
        let product = await db.Models.Product.create({
            category: object.category,
            price: object.price,
            description: object.description,
            url: object.url
        });
        res.send(product);
    });

    app.post('/reg', async (req, res) => {
        let object = convertToObj(req.body);
        let user = await db.Models.User.findOne({
            where: {
                login: object.login
            }
        });
        if (user == null) {
            let newUser = await db.Models.User.create({
                login: object.login,
                password: object.password,
                isAdmin: false,
            });
            res.send({
                login: newUser.login,
                isAdmin: newUser.isAdmin,
                token: jwt.sign({
                    login: object.login,
                    isAdmin: false
                }, secretKey)
            });
        }
        else {
            res.send(false);
        }
    });

    app.post('/category/update', async (req, res) => {
        let object = convertToObj(req.body);
        object = object.data;
        let id = parseInt(object.id);
        console.log(object);
        if (isNaN(id) || object.category == null || object.price == null || object.description == null || object.url == null) return res.send(false);
        let products = await db.Models.Product.update({
            category: object.category,
            price: object.price,
            description: object.description,
            url: object.url
        }, {
            where: {
                id: id,
            } 
        });
        res.send(object);
    });

    app.post('/category/delete', async (req, res) => {
        let object = convertToObj(req.body);
        object = object.data;
        let id = parseInt(object.id);

        if (isNaN(id)) return res.send(false);
        await db.Models.Product.destroy({
            where: {
                id: id,
            } 
        });
        res.send(true);
    });

    app.post('/upload', fileLoad.upload.single('file'), (req, res) => {
        const { file } = req;

        if(!file){
            console.log('File null');
            return res.send(false);
        }
        
        dropbox({
            resource: 'files/upload',
            parameters:{
                path: '/' + file.originalname
            },
            readStream: fs.createReadStream(path.resolve(fileLoad.PATH, file.originalname))
        }, (err, result, response) =>{
            if (err) return console.log(err);
    
            console.log('uploaded dropbox');
            res.send(true);
        });
    });
    
  
};
let convertToObj = function(obj) {
    return JSON.parse(obj.data);
}