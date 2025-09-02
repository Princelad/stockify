const mongoose = require('mongoose')

const ConnectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log(`Mongo Db connect Suceessfully ${conn.connection.host}`)
    }
    catch (err) {
        console.error(`MongoDB connection error: ${error.message}`)
        process.exit(1)
    }
}
module.exports = ConnectDb