const AppError = require('./AppError');

/**
 * RevenueError
 *
 * @class RevenueError
 * @extends { AppError }
 */
class RevenueError extends AppError {
  constructor (code, status, row) {
    // Providing default code and overriding status code.
    super(code || 'REVENUE_ERROR', status, row);
  }
}

module.exports = RevenueError;