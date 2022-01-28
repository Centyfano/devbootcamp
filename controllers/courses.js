const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

/**
 * Get all courses
 * @route /api/v1/courses — _All courses in all bootcamps_
 * @route /api/v1/bootcamps/`:bootcampId`/courses — _All courses in a bootcamp_
 * @param bootcampId Bootcamp ID
 * @method GET
 * @access Public
 */
exports.getCourses = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const courses = await Course.find({ bootcamp: req.params.bootcampId });

		return res.status(200).json({
			success: true,
			count: courses.length,
			data: courses,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

/**
 * Get single course
 * @route /api/v1/courses/`:id`
 * @param {*} id Course ID
 * @method GET
 * @access Public
 */
exports.getCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id).populate({
		path: "bootcamp",
		select: "name description",
	});

	if (!course) {
		return next(
			new ErrorResponse(`No course with the id of ${req.params.id}`),
			404,
		);
	}

	res.status(200).json({
		success: true,
		data: course,
	});
});

/**
 * Create a course
 * @route /api/v1/bootcamps/`:bootcampId`/courses
 * @param bootcampId Bootcamp ID
 * @method POST
 * @access Private - Only course owner or admin can create a course
 */
exports.createCourse = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`No bootcamp with the id of ${req.params.bootcampId}`,
			),
			404,
		);
	}

	/** Make sure user is bootcamp owner or admin */
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
				401,
			),
		);
	}

	const course = await Course.create(req.body);

	res.status(200).json({
		success: true,
		data: course,
	});
});

/**
 * Update a course
 * @route /api/v1/courses/`:id`
 * @param id Course ID
 * @method PUT
 * @access Private - Only course owner or admin can update a course
 */
exports.updateCourse = asyncHandler(async (req, res, next) => {
	let course = await Course.findById(req.params.id);

	if (!course) {
		return next(
			new ErrorResponse(`No course with the id of ${req.params.id}`),
			404,
		);
	}

	/** Make sure user is course owner */
	if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to update course ${course._id}`,
				401,
			),
		);
	}

	course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: course,
	});
});

/**
 * Delete a course
 * @route /api/v1/courses/`:id`
 * @param id Course ID
 * @method DELETE
 * @access Private - Only course owner or admin can delete a course
 */
exports.deleteCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id);

	if (!course) {
		return next(
			new ErrorResponse(`No course with the id of ${req.params.id}`),
			404,
		);
	}

	/** Make sure user is course owner */
	if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to delete course ${course._id}`,
				401,
			),
		);
	}

	await course.remove();

	res.status(200).json({
		success: true,
		data: {},
	});
});
