const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");

/**
 * Get all bootcamps
 * @route /api/v1/bootcamps
 * @method GET
 * @access Public
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

/**
 * Get single bootcamp by its id
 * @route /api/v1/bootcamps/`:id`
 * @param id The bootcamp ID, as a URL parameter
 * @method GET
 * @access Public
 */
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found with id of ${req.params.id}`,
				404,
			),
		);
	}

	res.status(200).json({ success: true, data: bootcamp });
});

/**
 * Create new bootcamp
 * @route /api/v1/bootcamps
 * @method POST
 * @access Private
 * @protected Only bootcamp owner or admin can create a bootcamp
 * @notes If the user is not an admin, they can only add one bootcamp
 */
exports.createBootcamp = aPublicsyncHandler(async (req, res, next) => {
	/** Add user to req.body */
	req.body.user = req.user.id;

	/** Check if user already has a published bootcamp */
	const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

	/** If the user is not an admin, they can only add one bootcamp */
	if (publishedBootcamp && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`The user with ID ${req.user.id} has already published a bootcamp`,
				400,
			),
		);
	}

	const bootcamp = await Bootcamp.create(req.body);

	res.status(201).json({
		success: true,
		data: bootcamp,
	});
});

/**
 * Update bootcamp
 * @route /api/v1/bootcamps/`:id`
 * @param id The bootcamp ID, as a URL parameter
 * @method PUT
 * @access Private
 * @protected Only bootcamp owner or admin can update a bootcamp
 */
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	let bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found with id of ${req.params.id}`,
				404,
			),
		);
	}

	/** Ensure the user is bootcamp owner */
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`User ${req.params.id} is not authorized to update this bootcamp`,
				401,
			),
		);
	}

	bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({ success: true, data: bootcamp });
});

/**
 * Delete bootcamp
 * @route /api/v1/bootcamps/`:id`
 * @param id The bootcamp ID, as a URL parameter
 * @method DELETE
 * @access Private
 * @protected Only bootcamp owner or admin can delete a bootcamp
 */
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found with id of ${req.params.id}`,
				404,
			),
		);
	}

	/** Ensure the user is bootcamp owner, or the admin */
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`User ${req.params.id} is not authorized to delete this bootcamp`,
				401,
			),
		);
	}

	bootcamp.remove();

	res.status(200).json({ success: true, data: {} });
});

/**
 * Get bootcamps within a radius of a given zipcode
 * @route /api/v1/bootcamps/radius/`:zipcode`/`:distance`
 * @param {*} zipcode
 * @param {*} distance distance in km
 * @method GET
 * @access Public
 */
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	/** Get lat/lng from geocoder */
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;

	/**
	 * Calculate radius using radians
	 * Divide distance by radius of Earth
	 * _Earth Radius = 3,963 mi / 6,378 km_
	 */
	const radius = distance / 3963;

	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
	});

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps,
	});
});

/**
 * Upload photo for a bootcamp
 * @route /api/v1/bootcamps/`:id`/photo
 * @param {*} id Bootcamp's id
 * @method PUT
 * @access Private
 * @protected Only bootcamp owner or admin can upload photo
 */
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found with id of ${req.params.id}`,
				404,
			),
		);
	}

	/** Ensure the user is bootcamp owner */
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`User ${req.params.id} is not authorized to update this bootcamp`,
				401,
			),
		);
	}

	if (!req.files) {
		return next(new ErrorResponse(`Please upload a file`, 400));
	}

	const file = req.files.file;

	/** Make sure the image is a photo */
	if (!file.mimetype.startsWith("image")) {
		return next(new ErrorResponse(`Please upload an image file`, 400));
	}

	/** Check filesize */
	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(
			new ErrorResponse(
				`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
				400,
			),
		);
	}

	/** Create custom filename */
	file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.error(err);
			return next(new ErrorResponse(`Problem with file upload`, 500));
		}

		await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

		res.status(200).json({
			success: true,
			data: file.name,
		});
	});
});
