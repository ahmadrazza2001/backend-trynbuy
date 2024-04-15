const xss = require("xss");
const allowedTags = {
  a: ["href", "title", "target"],
  img: ["src", "alt"],
};
const customXss = new xss.FilterXSS({
  whiteList: allowedTags,
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script"],
});
function inputSanitizer(req, res, next) {
  const sanitizeField = (field) => {
    if (typeof field === "string") {
      return customXss.process(field);
    } else if (Array.isArray(field)) {
      return field;
    } else if (typeof field === "object") {
      for (const key in field) {
        if (field.hasOwnProperty(key)) {
          field[key] = sanitizeField(field[key]);
        }
      }
    }
    return field;
  };
  for (const key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      req.body[key] = sanitizeField(req.body[key]);
    }
  }
  next();
}

module.exports = inputSanitizer;
