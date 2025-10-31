/**
 *
 * @param {object} obj
 * @returns object/array sorted by array items and object keys for arrays and object keys respectively
 */
const sortObject = obj => {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObject(obj[key]);
        return acc;
      }, {});
  }
  return obj;
};

module.exports = { sortObject };
