const mongoose = require("mongoose");
require("dotenv").config({ path: "../config/config.env" }); //;

/**
 * Connect to database
 */
const connectDB = async () => {
	console.log("url is " + process.env.MONGO_URI);
	const conn = await mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
	});

	console.log(
		`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold,
	);
};

module.exports = connectDB;
