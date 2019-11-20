const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("User", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        login: {
            type: Sequelize.STRING,
        },
        password: {
            type: Sequelize.STRING,
        },
        isAdmin: {
            type: Sequelize.BOOLEAN,
        },
        token: {
            type: Sequelize.STRING,
        },
    }, { timestamps: false });
    
    return model;
};