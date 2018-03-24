const gulp = require('gulp');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', () => {
    const tsResult = tsProject.src()
        .pipe(tsProject());
    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
    gulp.watch('src/**/*.ts', ['scripts']);
});

gulp.task('tslint', ()=>
    gulp.src("src/**/*.ts", { base: '.' })
        .pipe(tslint({
            configuration: "tslint.json",
            formatter: "verbose"
        }))
        .pipe(tslint.report())
);

gulp.task('default', ['watch']);