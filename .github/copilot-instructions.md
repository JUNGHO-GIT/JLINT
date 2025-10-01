0. The Maximum Java version is Java 11
1. The most important thing to keep in mind is to reduce unnecessary memory waste and leaks, and maximize performance and efficiency
2. But Do not shorten variable or parameter names to extremes. For example, do not use result => r And Never break a line before a semicolon
2. Change the code to arrow function format, and if it is a function, add the fn prefix in the format 'fnFoo'
3. Never change comments in the code I send, even if they are simple `----` lines
4. Use `JUST ONE SPACE` around assignment operators (ex. '=' or ':') and avoid more than one spacing for alignment
5. Always use line breaks and indentation in parentheses, square brackets
6. When rewriting, avoid using 'if' statements whenever possible and use symbols like the ternary operator or '&&' instead
7. When modifying existing code, revise all 'if' statements to use the ternary operator or symbols like '&&' for brevity
8. Nevertheless, only in the absolutely unavoidable case where you must use an 'if' conditional statement, follow these guidelines:
9-1. All if statements must use braces {..} and proper line breaks/indentation, especially when they contain return statements
9-2. Never write `if` statements on a single line.
9-3. Use `}\n\telse {` or `}\n\telse if {` or `}\n\tcatch {` instead of `}else{` or `}else if {` or `}catch{`
9-4. Convert all single-line if statements like `if (condition) return value;` to:`if (condition) {\n\treturn value;\n}`