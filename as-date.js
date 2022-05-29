/**
 * @param {*} val
 * @returns {Date | null}
 */
module.exports = function asDate (val) {
  if (val instanceof Date) {
    return check(val)
  }
  if (typeof val === 'number') {
    return check(new Date(val))
  }
  if (typeof val !== 'string' || !val) {
    return null
  }
  if (/^\d+$/.test(val)) {
    return new Date(+val)
  }

  return new Date(val)
}
