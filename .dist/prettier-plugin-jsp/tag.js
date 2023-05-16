const COLON = ":";
const DASH = "-";
const ESCAPE_TAG_COLON = "__colon__";
const ESCAPE_TAG_DASH = "__dash__";

const COLON_REGEX = new RegExp(COLON, "g");
const DASH_REGEX = new RegExp(DASH, "g");
const ESCAPE_TAG_COLON_REGEX = new RegExp(ESCAPE_TAG_COLON, "g");
const ESCAPE_TAG_DASH_REGEX = new RegExp(ESCAPE_TAG_DASH, "g");

const escapeTag = (text) => {
  if (text == null) return "";
  return text
    .replace(COLON_REGEX, ESCAPE_TAG_COLON)
    .replace(DASH_REGEX, ESCAPE_TAG_DASH);
};

const unescapeTag = (text) => {
  if (text == null) return null;
  return text
    .replace(ESCAPE_TAG_COLON_REGEX, COLON)
    .replace(ESCAPE_TAG_DASH_REGEX, DASH);
};

module.exports = {
  escape: escapeTag,
  unescape: unescapeTag,
};
