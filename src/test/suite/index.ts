// index.ts (test)
// @ts-nocheck

import * as path from "path";
import * as Mocha from "mocha";
import * as glob from "glob";

export function run(): Promise<void> {
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((c: any, e: any) => {
		glob('**/**.test.js', { cwd: testsRoot }, (err: any, files: any) => {
			if (err) {
				return e(err);
			}

      files.forEach((f: any) => {
        mocha.addFile(path.resolve(testsRoot, f));
      });

			try {
				mocha.run(failures => {
					if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          }
          else {
            c();
          }
				});
			}
      catch (err: any) {
				console.error(err);
				e(err);
			}
		});
	});
}
