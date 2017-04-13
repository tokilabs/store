import { Gulpclass, Task, SequenceTask } from "gulpclass";
import * as path from "path";
import * as gulp from "gulp";

const concatFilenames = require("gulp-concat-filenames");
const folders = require("gulp-folders");

// Gulpclass example: https://github.com/molecuel/mlcl_core/blob/master/tasks/gulpclass.ts

@Gulpclass()
export class Gulpfile {

  public sourceRoot: string = path.join(process.cwd(), "src");
  public excludeFolders = ["config"];

  private generateIndexFor(folder: string) {
      // This will loop over all folders inside pathToFolder main, secondary
      // Return stream so gulp-folders can concatenate all of them
      // so you still can use safely use gulp multitasking
      if (this.excludeFolders.indexOf(folder) > -1) return gulp.src("noop");

      return gulp
          .src([
            path.join(folder, "**/*.ts"),
            "!**/index.ts"
          ])
          .pipe(concatFilenames("index.ts", { template: (file: string) => `export * from "./${path.basename(file, ".ts")}";` }))
          .pipe(gulp.dest(folder));
  }

  @Task()
  rootIndex() {
    return this.generateIndexFor(this.sourceRoot);
  }

  @Task("indexes", ["rootIndex"])
  indexes() {
    return (folders(this.sourceRoot, (folder: string) => this.generateIndexFor(path.join(this.sourceRoot, folder) ) ))(()=>{});
  }

  @SequenceTask("watch") // this special annotation using "run-sequence" module to run returned tasks in sequence
  watch(): any {
    return gulp.watch([this.sourceRoot + "/**/*.ts"], ["indexes"]);
  }

  @SequenceTask("default")
  default() { // because this task has "default" name it will be run as default gulp task
    return ["indexes", "watch"];
  }

}