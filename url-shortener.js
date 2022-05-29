module.exports = function urlShortener () {
  /** @type {Map.<number, string>} */
  const urls = new Map()

  /** @returns {number} */
  const counter = (function () {
    let count = 0
    return () => ++count
  })()

  /**
   * @typedef {object} UrlShortenerResult
   * @property {string} original_url
   * @property {string} short_url
   */
  /**
   *
   * @param {string} url
   * @returns {UrlShortenerResult}
   */
  function add (url) {
    const id = counter()
    urls.set(id, url)

    return {
      original_url: url,
      short_url: id,
    }
  }

  /**
   * @param {*} id
   * @returns {(string | null)}
   */
  function find (id) {
    return urls.get(+id)
  }

  return { add, find }
}
