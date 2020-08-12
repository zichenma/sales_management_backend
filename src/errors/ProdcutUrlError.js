const AppError = require('./AppError');

/**
 * ProdcutUrlError
 *
 * @class ProdcutUrlError
 * @extends {AppError}
 */
class ProdcutUrlError extends AppError {
  constructor (code, status, row) {
    // Providing default code and overriding status code.
    super(code || 'PRODCUT_URL_ERROR', status, row);
  }
}

module.exports = ProdcutUrlError;