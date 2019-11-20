//cd C:\"Program Files"\PostgreSQL\11\bin
//pg_ctl -D /"Program Files"/PostgreSQL/11/data start
//npm run dev

let jwt = require('jsonwebtoken');
const secretKey = "myTestSecretKey";

module.exports = function(app, db) {
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:4200");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, descriptionization");
        next();
    }),
    app.get('/testdb', async (req, res) => {
        res.send(`DB url ${process.env.DATABASE_url}`);
    }),

    app.post('/category', async (req, res) => {
        let object = convertToObj(req.body);
        if (object.pageName == "admin"){
            jwt.verify(object.token, secretKey, async function(err, decoded){
                if(err) return res.send(false);
                if(!decoded.isAdmin) return res.send(false);
                let products = await db.Models.Product.findAll();
                res.send(products);
            });
        }
        else{
            let products = await db.Models.Product.findAll();
            res.send(products);
        }

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
            user.token = jwt.sign({ login: object.login, isAdmin: user.isAdmin }, secretKey);
            await user.save();
            res.send({
                login: user.login,
                token: user.token
            });
        }
        else {
            res.send(false);
        }
    });

    app.post('/category/create', async (req, res) => {
        let object = convertToObj(req.body);
        jwt.verify(object.token, secretKey, async function(err,decoded){
            if(err) return res.send(false);
            if(!decoded.isAdmin) return res.send(false);
            object = object.data;

            if ( object.category == null || object.price == null ||  object.description == null || object.url == null) return res.send(false);
            let product = await db.Models.Product.create({
                category: object.category,
                price: object.price,   
                description: object.description,
                url: object.url,
            });
            res.send(product);
        });
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
                token: jwt.sign({
                    login: object.login,
                    isAdmin: false
                }, secretKey)
            });
            res.send(true);
        }
        else {
            res.send(false);
        }
    });

    app.post('/category/update', async (req, res) => {
        let object = convertToObj(req.body);

        jwt.verify(object.token, secretKey, async function(err,decoded){
            if(err) return res.send(false);
            if(!decoded.isAdmin) return res.send(false);
            object = object.data;
            let id = parseInt(object.id);
           
            if (isNaN(id)  || object.category == null ||  object.price == null || object.description == null || object.url == null) return res.send(false);
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
    });

    app.post('/category/delete', async (req, res) => {
        let object = convertToObj(req.body);

        jwt.verify(object.token, secretKey, async function(err,decoded){
            if(err) return res.send(false);
            if(!decoded.isAdmin) return res.send(false);
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
    });
};
let convertToObj = function(obj) {
    for (const key in obj) {
        return JSON.parse(key);
    }
}