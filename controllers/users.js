const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

/**
 * Get all users
 * @route /api/v1/auth/users
 * @method GET
 * @access Private
 * @protected Only admin can access the `/auth/users/` route to see all users in the database
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

/**
 * Get a single user by ID
 * @route /api/v1/auth/users/`:id`
 * @param id - the user's ID
 * @method GET
 * @access Private
 * @protected Only admin can access the `/auth/users/` route to see user details
 */
exports.getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

/**
 * Create user
 * @route /api/v1/auth/users
 * @method POST
 * @access Private
 * @protected Only admin can access the `/auth/users/` route to create new user
 */
exports.createUser = asyncHandler(async (req, res, next) => {
	const user = await User.create(req.body);

	res.status(201).json({
		success: true,
		data: user,
	});
});

/**
 * Update a user
 * @route /api/v1/auth/users/`:id`
 * @param id User's ID
 * @method PUT
 * @access Private
 * @protected Only admin can access the `/auth/users/` route to update a user
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

/**
 * Delete a user
 * @route /api/v1/auth/users/`:id`
 * @param id User's ID
 * @method DELETE
 * @access Private
 * @protected Only admin can access the `/auth/users/` route to delete a user
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
	await User.findByIdAndDelete(req.params.id);

	res.status(200).json({
		success: true,
		data: {},
	});
});
