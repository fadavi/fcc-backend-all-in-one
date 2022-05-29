const asDate = require('./as-date')

class User {
  /**
   * @param {Object} props
   * @param {string} props.username
   */
  constructor ({ username }) {
    /**
     * @type {string}
     * @protected
     * @readonly
     */
    this._id = Math.random().toString(32).substring(2)

    /**
     * @type {string}
     * @protected
     * @readonly
     */
    this.username = username

    /**
     * @type {Exercise[]}
     * @protected
     * @readonly
     */    
    this.log = []
  }

  /** @param {Exercise} exercise */
  addExercise (exercise) {
    this.log.push(exercise)
  }

  /** @returns {Exercise | undefined} */
  getExercise () {
    return this.log.at(-1)
  }

  /**
   * @param {Object} opts
   * @param {boolean=} [opts=false]
   * @returns {Object}
   */
  toJSON ({ withExercise = false } = {}) {
    return {
      _id: this._id,
      username: this.username,
      ...(withExercise ? this.getExercise().toJSON() : null),
    } 
  }
  
  /**
   * @param {Object} opts
   * @param {*=} [opts.from]
   * @param {*=} [opts.to]
   * @param {number=} [opts.limit]
   * @returns {Exercise[]}
   */
  getLog ({ from, to, limit } = {}) {
    let result = this.log

    from &&= asDate(from)
    if (from && !isNaN(from)) {
      result = result.filter(e => e.date >= from)
    }
    
    to &&= asDate(to)
    if (to && !isNaN(to)) {
      result = result.filter(e => e.date <= to)
    }
    
    limit &&= Number(limit)
    if (limit && Number.isSafeInteger(limit)) {
      result = result.slice(0, limit)
    }

    return result
  }
}

class Exercise {
  /**
   * @param {Object} props
   * @param {string} props.description
   * @param {number} props.duration
   * @param {Date} props.date
   */
  constructor ({ description, duration, date }) {
    /**
     * @protected
     * @readonly
     */
    this.description = description

    /**
     * @protected
     * @readonly
     */
    this.duration = duration

    /**
     * @protected
     * @readonly
     */
    this.date = asDate(date)
  }

  /** @returns {Object} */
  toJSON () {
    return {
      description: this.description,
      duration: this.duration,
      date: this.date.toDateString(),
    }
  }
}

module.exports = function exerciseDao () {
  const users = []
  
  return {
    /** @returns {User[]} */
    getUsers: () => users,
    
    /** @param {User} user */
    addUser: user => users.push(user),

    /**
     * @param {string} userId
     * @returns {(User | undefined)}
     */
    findUser: userId => users.find(u => u._id === userId),
    
    Exercise,
    User,
  }
}
