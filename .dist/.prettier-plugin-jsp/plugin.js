const { parsers } = require("prettier/parser-html");
const {
  printer: { printDocToString },
} = require("prettier").doc;
const quotation = require("./quotation");
const tag = require("./tag");

const ESCAPE_TAG_REGEX = /<(\s*\/\s*)?([\w:-]+)/g;
const ESCAPE_JSP_TAG_REGEX = /<%@([\w\W]+?)%>/g;
const ESCAPE_ATTRS_REGEX = /<([\w]+)\s*([\s\S]*?)>/g;
const ESCAPE_ATTR_REGEX = /\$\{(.+?)\}/g;

const parser = {
  ...parsers.html,
  astFormat: "jsp",
  preprocess: (text) => {
    return text
      .replace(ESCAPE_JSP_TAG_REGEX, "<JSP $1 />")
      .replace(ESCAPE_TAG_REGEX, (_, m1, m2) => `<${m1 ?? ""}${tag.escape(m2)}`)
      .replace(ESCAPE_ATTRS_REGEX, (_, m1, m2) => {
        const attrs = m2.replace(
          ESCAPE_ATTR_REGEX,
          (_, m1) => "${" + quotation.escape(m1) + "}"
        );
        return `<${m1} ${attrs}>`;
      });
  },
};

const getPrinter = (options) => {
  const plugin = options.plugins.find((p) => p.parsers?.html);
  return plugin.printers.html;
};

/**
 * @type {import('prettier').Plugin}
 */
const plugin = {
  languages: [
    {
      name: "Java Server Pages",
      parsers: ["jsp"],
      tmScope: "text.html.jsp",
      aceMode: "jsp",
      codemirrorMode: "htmlembedded",
      codemirrorMimeType: "application/x-jsp",
      extensions: [".jsp", ".tag"],
      linguistLanguageId: 182,
      vscodeLanguageIds: ["jsp"],
    },
  ],
  parsers: {
    jsp: parser,
  },
  printers: {
    jsp: {
      preprocess: (ast, options) => {
        return getPrinter(options).preprocess(ast, options);
      },
      embed: (path, print, textToDoc, options) => {
        const node = path.getValue();
        switch (node.type) {
          case "attribute":
            node.value = quotation.unescape(node.value);
            node.name = quotation.unescape(node.name);
            if (node.name === style) return node.value;
            break;
          case "element":
            node.name = tag.unescape(node.name);
            break;
          case "text":
            node.value = quotation.unescape(node.value);
            break;
        }
        return getPrinter(options).embed(path, print, textToDoc, options);
      },
      print: (path, options, print) => {
        const node = path.getValue();
        if (node.type === "element" && node.name === "JSP") {
          const res = getPrinter(options).print(path, options, print);
          const txt = printDocToString(res, {
            ...options,
            printWidth: Infinity,
          }).formatted;
          return txt.replace(/^<JSP/, "<%@ ").replace(/\/>$/, "%>");
        } else {
          return getPrinter(options).print(path, options, print);
        }
      },
    },
  },
};

module.exports = plugin;
