var fs = require("fs");
var path = require("path");
var abcd = require("./rules/lint/Js.ts");
var filePath = process.argv[2];
var Reader = /** @class */ (function () {
    function Reader() {
    }
    Reader.prototype.readFile = function () {
        var data = fs.readFileSync(filePath, "utf8");
        try {
            console.log("_____________________");
            console.log(data);
            console.log("_____________________");
            for (var i = 0; i < abcd.length; i++) {
                var char = abcd[i];
                var count = (data.match(new RegExp(char, "gi")) || []).length;
                if (count > 0) {
                    console.log("".concat(char, "\uAC00 ").concat(count, "\uBC88 \uD3EC\uD568\uB428"));
                }
            }
            return data;
        }
        catch (err) {
            console.error(err);
            return err;
        }
    };
    Reader.prototype.copyFile = function () {
        var ext = path.extname(filePath);
        var basename = path.basename(filePath, ext);
        var destinationFile = "".concat(basename, "-2").concat(ext);
        var data = fs.copyFileSync(filePath, destinationFile);
        try {
            console.log("_____________________");
            console.log("\uD30C\uC77C\uC774 \uC131\uACF5\uC801\uC73C\uB85C \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4: ".concat(destinationFile));
            console.log("_____________________");
            return data;
        }
        catch (err) {
            console.log("_____________________");
            console.error("복사 중 오류 발생:", err);
            console.log("_____________________");
            return err;
        }
    };
    Reader.main = function () {
        var reader = new Reader();
        reader.readFile();
        reader.copyFile();
    };
    return Reader;
}());
Reader.main();
