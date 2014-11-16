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
      },
      templates: {
        files: [
          {
            src: ['content_scripts/tmboes.js', 'templates/template.js', 'build/templates.js'],
            dest: 'build/content_scripts/tmboes.js'
          }
        ]
      }
    },
    clean: {
      build: ["build/"],
      templates: ["build/templates.js"]
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
    },
    hogan: {
      templates: {
        options: {
          namespace: "tmboes.templates",
          defaultName: function(filename) {
            return filename.match(/([^/]+)\.mustache/)[1];
          },
          templateOptions: { asString: true, disableLambda: true }
          },
        files: {
          "build/templates.js": ["templates/*.mustache"]
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-templates-hogan');

  // Default task(s).
  grunt.registerTask('default', ['clean:build', 'uglify:build', 'templates', 'copy:build', 'compress:build']);
  grunt.registerTask('templates', ['hogan:templates', 'uglify:templates', 'clean:templates'])
};