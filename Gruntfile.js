'use strict';


module.exports = function (grunt) {
    // Load the project's grunt tasks from a directory
    require('grunt-config-dir')(grunt, {
        configDir: require('path').resolve('tasks')
    });
grunt.config.init({
   watch:
   {
       scripts:{
           files:['controllers/*.js'],
           tasks: ['build']
       }
       }
});

    // Register group tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('build', ['jshint', 'less', 'i18n', 'copyto']);
}


