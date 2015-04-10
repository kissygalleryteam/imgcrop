var gulp = require('gulp');
var kmc = require('gulp-kmc');
var less = require('gulp-less');
var css = require('gulp-mini-css');
var kclean = require('gulp-kclean');
var rename = require("gulp-rename");
var filter = require('gulp-filter');
var minify = require('gulp-minify');
var XTemplate = require('xtemplate');
var gulpXTemplate = require('gulp-xtemplate');
var path = require('path');
var src = ".",
  dest = "./build";

var root = process.cwd();
var bower = require('./bower.json');
var version = bower.version;
//包配置
var pkg = "kg/" + path.basename(root) + "/" + version;
var comboSuffix = '-combo';

kmc.config({
  packages: [{
    name: pkg,
    base: src
  }]
});

// kmc.server({
//   port: 8787,
//   fixModule: true,
//   path: dest,
//   kissy: true
// });

//使用kmc合并并编译kissy模块文件
function renderKmc(fileName) {
  var comboFiles = fileName.map(function(name) {
    return {
      src: pkg + "/" + name + ".js",
      dest: name + comboSuffix + ".js"
    };
  });
  var cleanFiles = fileName.map(function(name) {
    return {
      src: name + comboSuffix + '.js',
      outputModule: pkg + '/' + name
    };
  });
  return gulp.src([src + '/**/*.js', '!./node_modules/**/*.js', '!./test/**/*.js', '!./gulpfile.js', '!./build/**/*.js'])
    //转换cmd模块为kissy模块
    .pipe(kmc.convert({
      kissy: true,
      ignoreFiles: ['-min.js']
    }))
    //合并文件
    .pipe(kmc.combo({
      deps: 'mods.js',
      files: comboFiles
    }))
    //优化代码
    .pipe(kclean({
      files: cleanFiles
    }))
    .pipe(minify())
    .pipe(filter(function(file) {
      var files = fileName.map(function(name) {
        return name + comboSuffix + '.js';
      });
      return files.indexOf(file.relative) == -1;
    }))
    .pipe(rename(function(file) {
      fileName.forEach(function(name) {
        file.basename = file.basename.replace(name + comboSuffix + '-min', name + '-min');
      })
    }))
    .pipe(gulp.dest(dest));
}


gulp.task('kmc', function() {
  renderKmc(['index']);
});

gulp.task('mini-css', ['less'], function() {
  return gulp.src([src + '/**/*.css', '!./node_modules/**/*.css', '!./build/**/*.css'])
    .pipe(gulp.dest(dest))
    .pipe(css({
      ext: '-min.css'
    }))
    .pipe(gulp.dest(dest));
});

gulp.task('less', function() {
  return gulp.src([src + '/**/*.less', '!./node_modules/**/*.less'])
    .pipe(less())
    .pipe(gulp.dest(src));
});

gulp.task('css', ['mini-css']);


gulp.task('xtpl', function() {
  return gulp.src(src + '/**/*.xtpl')
    .pipe(gulpXTemplate({
      wrap: 'kissy',
      XTemplate: XTemplate
    }))
    .on('error', function(e) {
      console.log(e);
    })
    .pipe(gulp.dest(src));
});


gulp.task('default', ['kmc', 'css']);
