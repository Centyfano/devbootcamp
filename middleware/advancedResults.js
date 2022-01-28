const advancedResults = (model, populate) => async (req, res, next) => {
	let query;

	/** Copy req.query */
	let reqQuery = { ...req.query };

	/** Create nested location.state from `state` key */
	const n = {};
	delete Object.assign(n, reqQuery, {
		["location.state"]: reqQuery["state"],
	})["state"];
	if (n["location.state"] === undefined) delete n["location.state"];

	reqQuery = { ...n };

	/** Fields to exclude */
	const removeFields = ["select", "sort", "page", "limit"];

	/** Loop over removeFields and delete them from reqQuery */
	removeFields.forEach((param) => delete reqQuery[param]);

	/** Create a query string */
	let queryStr = JSON.stringify(reqQuery);

	/** Create operators ($gt, $gte, etc) */
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`,
	);
	// console.log(JSON.parse(queryStr));

	/** Finding resource */
	query = model.find(JSON.parse(queryStr)).populate(populate);

	/** Select Fields */
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		query = query.select(fields);
	}

	/** Sort */
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		query = query.sort("-createdAt");
	}

	/** Pagination */
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 25;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments();

	query = query.skip(startIndex).limit(limit);

	if (populate) {
		query = query.populate(populate);
	}

	// console.log("query is", query);

	/** Executing final query */
	const results = await query;

	/** Pagination result */
	const pagination = {};

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	res.advancedResults = {
		success: true,
		count: results.length,
		pagination,
		data: results,
	};

	next();
};

module.exports = advancedResults;
