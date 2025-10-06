0. Maximum Java version: Java 11
1. Priority: reduce memory waste/leaks, maximize performance and efficiency
2. Do not shorten variable/parameter names to extremes (e.g., result => r)
3. Never break a line before a semicolon
4. Use arrow function format and add 'fn' prefix (e.g., 'fnFoo')
5. Never change comments, even simple `----` lines
6. Use JUST ONE SPACE around assignment operators ('=' or ':')
7. ALWAYS use line breaks and indentation after '{' and before '}' for all brackets: '()', '[]', '{}'
8. Avoid 'if' statements - use ternary operator or '&&' / '||' instead
9. When modifying code, convert all 'if' statements to ternary or '&&' / '||'
10. ONLY when 'if', 'else', 'else if', 'try', 'catch', 'finally' are unavoidable:
	- Must use braces {..} with line breaks and indentation
	- Line break immediately after '{' and before '}'
	- Never write on a single line
	- Format: `}\n\telse {` or `}\n\telse if (condition) {` or `}\n\tcatch (Exception e) {` or `}\n\tfinally {`

CORRECT:
if (condition) {
	return value;
}
else {
	doOther();
}

INCORRECT:
if (condition) { return value; }
if (condition) return value;