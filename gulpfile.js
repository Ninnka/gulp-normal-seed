var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var cleanCss = require('gulp-clean-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var pump = require('pump');
var imageMin = require('gulp-imagemin');
var cache = require('gulp-cache');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var proxyMiddleware = require('http-proxy-middleware');

// 压缩图片
// var dirpath = "/after/";
// var enableWebp = true;
gulp.task('copyimage', function () {
  gulp.src(['./src/images/**/*.png'])
    .pipe(imageMin([
      imageMin.jpegtran({progressive: true}),
	    imageMin.optipng({optimizationLevel: 5})
    ]))
    .pipe(gulp.dest('./dist/static/images'));
  gulp.src(['./src/images/**/*.jpg'])
    .pipe(imageMin())
    .pipe(gulp.dest('./dist/static/images'));
});

// 任务：复制html文件
gulp.task('html', function () {
  gulp.src("./src/template/**/*.html")
    .pipe(gulp.dest("./dist"));
});

gulp.task('css', function () {
  gulp.src("./src/css/**/*.css")
    .pipe(gulp.dest("./dist/static/css"));
});

gulp.task('less', function () {
  gulp.src('./src/less/**/*.less')
    .pipe(less())
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(cleanCss({compatibility: 'ie9'}))
    .pipe(sourcemaps.write('./maps'))
    .pipe(rename({
      extname: ".min.css"
    }))
    .pipe(gulp.dest('./dist/static/css'));
});

gulp.task('lessNormal', function () {
  gulp.src('./src/less/**/*.less')
  .pipe(less())
  .pipe(gulp.dest('./dist/static/css'));
});

// 任务：将多个js文件打包成一个js文件
gulp.task('concatjs', function () {
  gulp.src('./src/js/**/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest("./dist/static/js"));
});

gulp.task('js', function (cb) {
  pump([
    gulp.src('./src/js/**/*.js'),
    rename({
      suffix: '.min'
    }),
    uglify(),
    gulp.dest('./dist/static/js')
  ], cb);
});

gulp.task('lib', function () {
  gulp.src('./src/lib/**/*.js')
    .pipe(gulp.dest('./dist/static/js'));
  gulp.src('./src/lib/**/*.css')
    .pipe(cleanCss())
    .pipe(rename({
      extname: ".min.css"
    }))
    .pipe(gulp.dest('./dist/static/css'));
});

gulp.task('browserSync', function() {
  var middleware = proxyMiddleware('/api', {
    target: 'http://mxc.golink56.com',
    changeOrigin: true,
    pathRewrite: {
        '^/api' : '/',
    },
  });
  var bs = browserSync.init({
    server: {
      baseDir: './dist',
      middleware: middleware
    }
  });
});

// 开启browser-sync的服务器
gulp.task('dev', ['browserSync', 'html', 'less', 'css', 'lib', 'js', 'copyimage'], function () {

  gulp.watch('./src/css/**/*.css', ['css']);

  gulp.watch('./src/less/**/*.less', ['less']);

  gulp.watch('./dist/static/css/**/*.css').on('change', reload);

  gulp.watch('./src/images/**/*.png', ['copyimage']);
  gulp.watch('./src/images/**/*.jpg', ['copyimage']);

  gulp.watch('./src/js/**/*.js', ['js'])
    .on('change', reload);

  gulp.watch('./src/template/**/*.html', ['html'])
    .on('change', reload);

});