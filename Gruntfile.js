module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['Gruntfile.js', 'app/ng-app/*.js', 'app/ng-app/**/*.js'],
			options: {
				// options here to override JSHint defaults
				eqeqeq: true,
				indent: 4,
				latedef: true,
				unused: true,
				globals: {
					jQuery: true,
					console: true,
					module: true,
					document: true
				}
			}
		},
		connect: {
			server: {
				options: {
					base: 'app/',
					port: 8000,
					open: true
				}
			}
		},
		watch: {
			options: {
				livereload: true
			},
			files: ['<%= jshint.files %>', 'app/**/*.*', 'app/ng-app/*.*'],
			tasks: ['test']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('test', ['jshint']);

	grunt.registerTask('serve', ['jshint', 'connect', 'watch']);

};
