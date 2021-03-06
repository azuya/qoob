'use strict';
module.exports = function(grunt) {

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        shell: {
            gitpull: {
                command: 'git pull "origin" master'
            }
        },
        uglify: {
            loader: {
                files: {
                    'loader.min.js': ['loader.js']
                }
            },
            front: {
                files: {
                    'qoob-frontend-starter.min.js': ['qoob-frontend-starter.js']
                }
            },
            back: {
                files: {
                    'qoob-backend-starter.min.js': ['qoob-backend-starter.js']
                }
            }

        },
        jshint: {
            loader: ['loader.js'],
            front: ['qoob-frontend-starter.js'],
            back: ['qoob-backend-starter.js']
        }
    });

    //Load Tasks
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    //register Tasks
    grunt.registerTask('loader', ['jshint:loader', 'uglify:loader']);
    grunt.registerTask('front', ['jshint:front', 'uglify:front']);
    grunt.registerTask('back', ['jshint:back', 'uglify:back']);
    grunt.registerTask('build', ['shell:gitpull', 'loader', 'front', 'back']);
    grunt.registerTask('default', ['build']);
};
