"use strict";

/**
 * Flatten the given `arr`.
 *
 * @param {Array} arr
 * @param {Array} [ret]
 * @return {Array}
 * @api private
 */

exports.flatten = function (arr, ret) {
	ret = ret || [];
	const len = arr.length;
	for (let i = 0; i < len; ++i) {
		if (Array.isArray(arr[i])) {
			exports.flatten(arr[i], ret);
		} else {
			ret.push(arr[i]);
		}
	}
	return ret;
};

/**
 * Merge object b with object a.
 *
 *     var a = { foo: 'bar' }
 *       , b = { bar: 'baz' };
 *
 *     merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api public
 */

exports.merge = function (a, b) {
	if (a && b) {
		for (let key in b) {
			a[key] = b[key];
		}
	}
	return a;
};

exports.isNullOrUndefined = function (obj) {
	return obj === undefined || obj === null;
};
