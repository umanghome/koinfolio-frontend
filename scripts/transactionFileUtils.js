/**
 * Contains methods for parsing csv files.
 * Usage:
 *  parseCsv(orderFile, 'order')
 *  parseCsv(walletFile, 'wallet')
 */

const orderFieldsToIgnore = ['fees_percentage'];
const walletFieldsToIgnore = ['generated_by'];

/**
 * Checks if the string is a proper csv format and returns a json object.
 * Please check if "status" field is "success" before reading "data".
 */
function parseCsv(csv) {
  if (csv.length === 0) {
    return {
      'status': 'error',
      'message': 'The file is empty.'
    }
  }
  let fileType = 'unknown';
  // Determines if the file is of wallet transactions, by searching for "Quantity" string.
  if (csv.indexOf('Quantity') > -1) {
    fileType = 'order'
  }
  // Determines if the file is of order transactions, by searching for "Generated" string.
  if (csv.indexOf('Generated') > -1) {
    fileType = 'wallet'
  }
  if (fileType !== 'unknown') {
    let data = -1;
    if (fileType === 'order') {
      data = parseOrderFile(csv)
    } else if (fileType === 'wallet') {
      data = parseWalletFile(csv)
    }
    if (data === -1) {
      return {
        'status': 'error',
        'message': 'Error while parsing ' + fileType + ' file.'
      }
    } else {
      return {
        'status': 'success',
        'message': fileType + ' file parsed successfully.',
        'fileType': fileType,
        'data': data
      }
    }
  } else {
    return {
      'status': 'error',
      'message': 'The file type is unknown.'
    }
  }
}

/**
 * Converts Order file from CSV to JSON.
 * Returns -1 if error.
 */
function parseOrderFile(csv) {
  let lines = csv.split(/\r\n|\n/);
  if (lines.length < 2) {
    return -1;
  }
  let headers = lines[0].split(',');
  headers = headers.map(getFriendlyName);
  let data = [];
  for (let i = 1; i < lines.length; i++) {
    let values = lines[i].split(',');
    if (values.length > 1) {
      if (values.length === headers.length) {
        let transaction = [];
        for (let j = 0; j < values.length; j++) {
          if (orderFieldsToIgnore.indexOf(headers[j]) === -1) {
            transaction[headers[j]] = values[j]
          }
        }
        transaction['amount'] = (transaction['type'] === 'BUY' ? '+' : '-') + transaction['amount'];
        transaction['price'] = Number(transaction['price']);
        transaction['qty'] = Number(transaction['qty']);
        transaction['amount'] = Number(transaction['amount']);
        transaction['total_amount'] = Number(transaction['total_amount']);
        transaction['fees'] = Number(transaction['fees']);
        transaction['timestamp'] = castStringToDate(transaction['timestamp']);
        data.push(transaction)
      } else {
        console.error('No. of values don\'t match no. of headers.', values.length, headers.length);
        return -1;
      }
    }
  }
  return data
}

/**
 * Converts Wallet file from CSV to JSON.
 * Returns -1 if error.
 */
function parseWalletFile(csv) {
  let lines = csv.split(/\r\n|\n/);
  if (lines.length < 2) {
    return -1;
  }
  let headers = lines[0].split(',');
  headers = headers.map(getFriendlyName);
  let data = [];
  for (let i = 1; i < lines.length; i++) {
    let values = lines[i].split(',');
    if (values.length > 1) {
      if (values.length === headers.length) {
        let transaction = [];
        for (let j = 0; j < values.length; j++) {
          if (walletFieldsToIgnore.indexOf(headers[j]) === -1) {
            transaction[headers[j]] = values[j]
          }
        }
        transaction['amount'] = (transaction['type'] === 'deposit' ? '+' : '-') + transaction['amount'];
        transaction['amount'] = Number(transaction['amount']);
        transaction['total_amount'] = Number(transaction['total_amount']);
        transaction['fees'] = Number(transaction['fees']);
        transaction['timestamp'] = castStringToDate(transaction['timestamp']);
        data.push(transaction)
      } else {
        console.error('No. of values don\'t match no. of headers.', values.length, headers.length);
        return -1;
      }
    }
  }
  return data
}

/**
 * Converts string like "Price Per Unit" to "price_per_unit".
 * Returns -1 if error.
 */
function getFriendlyName(name) {
  switch (name) {
    case 'Quantity':
      return 'qty';
    case 'Price per unit':
      return 'price';
    default:
      // replace spaces with underscores and converts to lower case
      return name.split(' ').join('_').toLowerCase()
  }
}

/**
 * Casts string to date. "MM-DD-YYYY hh:mm" is the required format.
 * Returns a Date object.
 */
function castStringToDate(str) {
  if (str !== undefined && str.length === 16) {
    let day = str.slice(0, 2);
    let month = str.slice(3, 5);
    let americanDateString = month + '-' + day + str.slice(5); // MM-DD-YYYY HH:MM
    return new Date(americanDateString);
  } else {
    console.error('Error casting ' + str + ' to date.')
  }
  return new Date()
}