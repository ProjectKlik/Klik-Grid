window.getVariable = function (cssVar) {
  const val = getComputedStyle(document.body).getPropertyValue(cssVar)?.trim();
  return val?.replace(/^["']|["']$/g, '') || cssVar;
};