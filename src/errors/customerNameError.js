const AppError = require('./AppError');

/**
 * customerNameError
 *
 * @class customerNameError
 * @extends { AppError }
 */
class customerNameError extends AppError {
  constructor (code, status, row) {
    // Providing default code and overriding status code.
    super(code || 'CUSTOMER_NAME_ERROR', status, row);
  }
}

module.exports = customerNameError;