'use strict';

module.exports = function (grunt) {
    // Show elapsed time at the end
    require('time-grunt')(grunt);
    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);
    // Project configuration.
    grunt.initConfig({
        nodeunit: {
            all: ['test/*_test.js']
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            main: {
                src: ['node-skeleton.js']
            },
            phantom: {
                src: ['phantom/*.js']
            },
            libs: {
                src: ['libs/*.js']
            },
            test: {
                src: ['test/*.js']
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '<%= jshint.main.src %>',
                tasks: ['jshint:main']
            },
            phantom: {
                files: '<%= jshint.phantom.src %>',
                tasks: ['jshint:phantom']
            },
            libs : {
                files : '<%= jshint.libs.src %>',
                tasks : ['jshint:libs']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test']
            }
        }
    });

  // Default task.
  grunt.registerTask('default', ['jshint', 'watch']);
};
