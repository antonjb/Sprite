module.exports = function(grunt){

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),
		src: 'sprite.js',
		banner: ['/*\n',
			' * Sprite - <%= pkg.version %>\n',
			' * <%= pkg.homepage %>\n',
			' * <%= pkg.author %>\n',
			' * MIT license\n',
			' * @license\n',
			' */'].join(''),

		jshint: {
			options:{
				jshintrc: true,
			},
			files: '<%= src %>'
		},

		uglify: {
			options: {
				banner: '<%= banner %>',
				report: 'min',
				preserveComments: 'some'
			},
			build: {
				files: {
					'sprite.min.js': '<%= src %>'
				}
			}
		}

	});

	// NPM Tasks
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Tasks
	grunt.registerTask('default', ['jshint', 'uglify']);

};