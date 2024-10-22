'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      dist: {
        src: [
          '<banner:meta.banner>',
          'lib/d3.v2.min.js',
          'lib/elastic.min.js',
          'src/evo.modules.js',
          'src/services/modules/**/*.js',
          'src/graphing/modules/**/*.js'
        ],
        dest: 'dist/evo.js'
      },
      evo: {
        src: [
          '<banner:meta.banner>',
          'src/evo.modules.js'
        ],
        dest: 'dist/evo.modules.js'
      },
      ejs: {
        src: [
          '<banner:meta.banner>',
          'src/services/modules/ejs/ejs.js'
        ],
        dest: 'dist/ejs.js'
      },
      donut: {
        src: [
          '<banner:meta.banner>',
          'src/graphing/modules/donut/donut.js'
        ],
        dest: 'dist/evo.graphing.donut.js'
      },
      pie: {
        src: [
          '<banner:meta.banner>',
          'src/graphing/modules/pie/pie.js'
        ],
        dest: 'dist/evo.graphing.pie.js'
      },
      bar: {
        src: [
          '<banner:meta.banner>',
          'src/graphing/modules/bar/bar.js'
        ],
        dest: 'dist/evo.graphing.bar.js'
      },
      column: {
        src: [
          '<banner:meta.banner>',
          'src/graphing/modules/column/column.js'
        ],
        dest: 'dist/evo.graphing.column.js'
      },
      area: {
        src: [
          '<banner:meta.banner>',
          'src/graphing/modules/area/area.js'
        ],
        dest: 'dist/evo.graphing.area.js'
      },
      datehisto: {
        src: [
          '<banner:meta.banner>',
          'src/graphing/modules/date-histo/datehisto.js'
        ],
        dest: 'dist/evo.graphing.datehisto.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/evo.min.js'
      },
      services: {
        src: ['<banner:meta.banner>', 'src/services/modules/**/*.js'],
        dest: 'dist/evo.services.min.js'
      },
      ejs: {
        src: ['<banner:meta.banner>', 'src/services/modules/ejs/ejs.js'],
        dest: 'dist/ejs.min.js'
      },
      graphing: {
        src: ['<banner:meta.banner>', 'src/graphing/modules/**/*.js'],
        dest: 'dist/evo.graphing.min.js'
      },
      donut: {
        src: ['<banner:meta.banner>', 'src/graphing/modules/donut/donut.js'],
        dest: 'dist/evo.graphing.donut.min.js'
      },
      pie: {
        src: ['<banner:meta.banner>', 'src/graphing/modules/pie/pie.js'],
        dest: 'dist/evo.graphing.pie.min.js'
      },
      bar: {
        src: ['<banner:meta.banner>', 'src/graphing/modules/bar/bar.js'],
        dest: 'dist/evo.graphing.bar.min.js'
      },
      column: {
        src: ['<banner:meta.banner>', 'src/graphing/modules/column/column.js'],
        dest: 'dist/evo.graphing.column.min.js'
      },
      area: {
        src: ['<banner:meta.banner>', 'src/graphing/modules/area/area.js'],
        dest: 'dist/evo.graphing.area.min.js'
      },
      datehisto: {
        src: ['<banner:meta.banner>', 'src/graphing/modules/date-histo/datehisto.js'],
        dest: 'dist/evo.graphing.datehisto.min.js'
      }
    },
    lint: {
      files: [
        'grunt.js', 
        '<config:concat.dist.dest>', 
        'src/**/*.js'
      ]
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint test'
    },
    jshint: {
      options: {
        bitwise: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        indent: 2,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        globalstrict: true
      },
      globals: {
        exports: true,
        module: false
      }
    },
    uglify: {
      codegen: {
        ascii_only: true
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'concat min');

};
