/* Node.js scripts for packaging */
/* 用于项目打包的 Node.js 脚本 */

"use strict";

var fs = require("fs");
var childProcess = require('child_process');

var mkdirIfNotExit = function(path) {
    if(fs.existsSync(path)) return;
    fs.mkdirSync(path);
}

// delete directory (recursive)
var rmdir = function(path, removeSelf) {
    if(!fs.existsSync(path)) return;

    fs.readdirSync(path).forEach(function(file) {
        var curPath = path + "/" + file;
        if(fs.statSync(curPath).isDirectory()) {
            // recurse
            rmdir(curPath, true);
        } else {
            // delete file
            fs.unlinkSync(curPath);
        }
    });
    if(arguments.length>=2 && removeSelf) {
        fs.rmdirSync(path);
    }
};

// delete directory (not including itself)
var clearDir = function (path) {
    rmdir(path);
};

// copy file
var copyFile = function(source, destination) {
	if(!fs.existsSync(source)) {
		console.warn(source+" not exits.");
		return;
	}
    fs.createReadStream(source)
        .pipe(
            fs.createWriteStream(destination));
};

// copy directory (recursive)
var copyFolder = function(source, destination, except) {
    var hasExcept = arguments.length >=3;

    var dirs = fs.readdirSync(source);
    dirs.forEach(function(f, i) {
        let filename = source + "/" + f;
        if(fs.statSync(filename).isFile()) {
            if(hasExcept && f.match(except)) return;

            if(!fs.existsSync(destination)) {
                fs.mkdirSync(destination);
            }
            //console.log("copy: ", filename, destination+"/"+f);
            copyFile(filename, destination+"/"+f);

        } else if(fs.statSync(filename).isDirectory()) {
            let dest = destination + "/" + f;
            if(!fs.existsSync(dest)) {
                fs.mkdirSync(dest);
            }
            copyFolder(filename, dest, except);
        }
    });
};


// install dependencies
//console.log( "0. Install dependencies with Node.js");
//childProcess.execSync("npm install", {stdio: [0, 1, 2]});

// create folders
console.log("\n1. Create folders inside 'dist' if not exits.");
mkdirIfNotExit("./dist/img");
mkdirIfNotExit("./dist/assets");

// copy files
console.log("\n2. Copy destination files to directory 'dist'.");

console.log("  - copying index.html...");
copyFile("./src/index.html", "./dist/index.html");

console.log("  - copying images...");
copyFolder("./src/styles/img", "./dist/img");
copyFolder("./src/styles/img/icons", "./dist/img/icons");


console.log("  - copying JavaScript files...");
//copyFile("./ih5core.js", "./dist/ih5core.js");
//copyFile("./ih5bridge.js", "./dist/ih5bridge.js");

// done
console.log("\nCongratulations!");
console.log("Now you can deploy your project with folder 'dist'.");