function toJSON(jsonStr, def = null) {
  try {
    if (jsonStr) return JSON.parse(jsonStr);
    return def;
  } catch (e) {
    return def;
  }
}