//pg_ctl -D /postgresql/data start
module.exports = function(app, db) {
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:4200");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    }),
    app.get('/testdb', async (req, res) => {
        res.send(`DB url ${process.env.DATABASE_URL}`);
    }),
    app.get('/product', async (req, res) => {
        let products = await db.Models.Product.findAll();
        res.send(products);
    });
    app.post('/product/create', async (req, res) => {
        let object = convertToObj(req.body);
        if (object.URL == null || object.author == null || object.categoryName == null) return res.send(false);
        let product = await db.Models.Product.create({
            URL: object.URL,
            author: object.author,
            categoryName: object.categoryName
        });
        res.send(product);
    });
    app.post('/product/update', async (req, res) => {
        let object = convertToObj(req.body);

        let id = parseInt(object.id);
        if (isNaN(id) || object.URL == null || object.author == null || object.categoryName == null) return res.send(false);
        let product = await db.Models.Product.update({
            URL: object.URL,
            author: object.author,
            categoryName: object.categoryName
        }, {
            where: {
                id: id,
            } 
        });
        res.send(object);
    });

    app.post('/product/delete', async (req, res) => {
        let object = convertToObj(req.body);

        let id = parseInt(object.id);
        if (isNaN(id)) return res.send(false);
        await db.Models.Product.destroy({
            where: {
                id: id,
            } 
        });
        res.send(true);
    });
};
let convertToObj = function(obj) {
    for (const key in obj) {
        return JSON.parse(key);
    }
}