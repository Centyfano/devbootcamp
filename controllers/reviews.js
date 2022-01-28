const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");

/**
 * Get all reviews for a bootcamp
 * @route /api/v1/bootcamps/`:bootcampId`/reviews
 * @param bootcampId Bootcamp ID
 * @method GET
 * @access Public
 */
exports.getReviews = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const reviews = await Review.find({ bootcamp: req.params.bootcampId });

		return res.status(200).json({
			success: true,
			count: reviews.length,
			data: reviews,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

/**
 * Get single review by ID
 * @route /api/v1/reviews/`:id`
 * @param id Review ID
 * @method GET
 * @access Public
 */
exports.getReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id).populate({
		path: "bootcamp",
		select: "name description",
	});

	if (!review) {
		return next(
			new ErrorResponse(
				`No review found with the id of ${req.params.id}`,
				404,
			),
		);
	}

	res.status(200).json({
		success: true,
		data: review,
	});
});

/**
 * Create a review for a bootcamp
 * @route /api/v1/bootcamps/`:bootcampId`/reviews
 * @param bootcampId Bootcamp ID
 * @method POST
 * @access Private
 * @notes Only user or admin can create a review
 */
exports.createReview = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`No bootcamp with the id of ${req.params.bootcampId}`,
				404,
			),
		);
	}

	const review = await Review.create(req.body);

	res.status(201).json({
		success: true,
		data: review,
	});
});

/**
 * Update a review
 * @route /api/v1/reviews/`:id`
 * @param bootcampId Bootcamp ID
 * @method PUT
 * @access Private - Only review owner or admin can edit a review
 */
exports.updateReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id);

	if (!review) {
		return next(
			new ErrorResponse(`No review with the id of ${req.params.id}`, 404),
		);
	}

	/** Make sure review belongs to user or user is admin */
	if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(new ErrorResponse(`Not authorized to update review`, 401));
	}

	review = await Review.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: review,
	});
});

/**
 * Delete a review
 * @route /api/v1/reviews/`:id`
 * @param id Review ID
 * @method DELETE
 * @access Private - Only review owner or admin can delete a review
 */
exports.deleteReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id);

	if (!review) {
		return next(
			new ErrorResponse(`No review with the id of ${req.params.id}`, 404),
		);
	}

	/** Make sure review belongs to user or user is admin */
	if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(new ErrorResponse(`Not authorized to update review`, 401));
	}

	await review.remove();

	res.status(200).json({
		success: true,
		data: {},
	});
});
