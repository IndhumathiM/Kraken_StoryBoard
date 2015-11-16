'use strict';


module.exports = function watchjs(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-contrib-watch');

    return {

        watch: {
            templates: {
                files: ['public/templates/*.dust'],
                tasks: ['dustjs:dev']
            },
            js: {
                files: ['controllers/*.js'],
                tasks: ['build:dev']
            }
        }
    };

};