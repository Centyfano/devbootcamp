const mongoose = require("mongoose");

/**
 * Connect to database
 */
const connectDB = async () => {
	const conn = mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
	});

	console.log(
		`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold,
	);
};

module.exports = connectDB;
