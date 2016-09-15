#! /usr/bin/env node

var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var path = require('path');``
var read = require('fs-readdir-recursive')

var cwd = process.cwd();

var packageJson = require(path.resolve(cwd, 'package.json'));

var dependencies = Object.keys(packageJson.dependencies ? packageJson.dependencies : {});
var devDependencies = Object.keys(packageJson.devDependencies ? packageJson.devDependencies : {});

var allDependencies = dependencies.concat(devDependencies);

var usedDependencies = [];

function inspectFile(contents, fileName) {
	_.forEach(
		allDependencies,
		function(dependency) {
			if (contents && contents.indexOf("'" + dependency + "'") !== -1) {
				usedDependencies.push(dependency);

				usedDependencies = usedDependencies.filter(
					function(item, pos) {
						return usedDependencies.indexOf(item) == pos;
					}
				);
			}
		}
	);
}

var userArgs = process.argv.slice(2);
var filePathRegex = new RegExp(userArgs[0]);

var files = read(cwd).filter(
	function(file) {
		if (/package.json/.test(file)) {
			return false;
		}

		return filePathRegex.test(file);
	}
);

async.each(
	files,
	function(file, callback) {
		fs.readFile(file, 'utf-8',
			function(err, contents) {
				inspectFile(contents, file);

				callback();
			}
		);
	},
	function() {
		console.log('Un-declared dependencies:\n', _.difference(allDependencies, usedDependencies));
	}
);
