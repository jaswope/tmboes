module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        files: [
          {
            expand: true,
            src: 'content_scripts/*.js',
            dest: 'build'
          },
          {
            src: 'background.js',
            dest: 'build/background.js'
          }
        ]
      }
    },
    clean: {
      build: ["build/"]
    },
    copy: {
      build: {
        files: [
          {
            expand: true,
            src: ['icons/*', 'styles/*', 'manifest.json'],
            dest: 'build'
          }
        ]
      }
    },
    compress: {
      build: {
        options: {
          archive: "package/<%= pkg.name %>-<%= pkg.version %>.zip"
        },
        files: [
          {
            expand: true,
            cwd: "build",
            src: ['**']
          }
        ]
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');

  // Default task(s).
  grunt.registerTask('default', ['clean:build', 'uglify:build', 'copy:build', 'compress:build']);

};