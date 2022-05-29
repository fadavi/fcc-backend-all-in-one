/**
 * @param {string} str
 * @returns {boolean}
 */
module.exports = function validateUrl (str) {
  try {
    const { protocol } = new URL(str)
    return ['http:', 'https:'].includes(protocol)
  } catch {
    return false
  }
}
