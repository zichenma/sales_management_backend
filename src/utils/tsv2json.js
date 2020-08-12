const fs = require('async-file');
const _ = require('lodash');
const path = require('path');
const CONSTANTS = require('../constants');
const { 
  CustomerNameError,
  ProdcutUrlError,
  RevenueError } = require('../errors');
const {
  CUSTOMER_NAME_ERROR,
  CATEGORY_ERROR, 
  SUB_CATEGORY_ERROR, 
  PRODCUT_ID_ERROR,
  REVENUE_ERROR,
 } = require('../errors/errorMessages');



const getItemFromRow = (fields, header, headerString) => {
  return fields[_.indexOf(header, headerString)] || '';
}

/**
 * if Category, Sub-Category, or prodcut Id are invalid, throw
 * correspondence errors
 * @return { Object } if errors, it returns an error object 
 *  e.g. {name: ProdcutUrlError, code: 'CATEGORY_ERROR', status: 500, row: 23}
 */
const getProductUrlFromLineItem = (fields, header) => {
  try {
    const baseUrl = CONSTANTS.BASE_URL;
    const category = getItemFromRow(fields, header, 'Category');
    const subCategory = getItemFromRow(fields, header, 'Sub-Category');
    const productId = getItemFromRow(fields, header, 'Product ID');
    const row = fields[0];
    if (!category) throw new ProdcutUrlError(CATEGORY_ERROR, 500, row);
    if (!subCategory) throw new ProdcutUrlError(SUB_CATEGORY_ERROR, 500, row);
    if (!productId) throw new ProdcutUrlError(PRODCUT_ID_ERROR, 500, row);
    return encodeURI([baseUrl, category, subCategory, productId].join('/'));
  } catch (e) {
    return e;
  }
}

/**
 * if revenue is invalid, throw revenue error
 * @return { Object } if errors, it returns an error object 
 */

const getPriceFromSales = (fields, header) => {
  try {
    const revenue = parseFloat(getItemFromRow(fields, header, 'Sales'));
    const row = fields[0];
    if (isNaN(revenue)) throw new RevenueError(REVENUE_ERROR, 500, row);
    return revenue;
  } catch (e) {
    return e;
  }
}

const orderDateToISODate = (orderDate) => {
  try {
    return new Date(orderDate).toISOString();
  } catch (e) {
    return '';
  }
}

const getISOOrderDateIfAfter = (fields, header, dateString) => {
  try {
    const orderDate = getItemFromRow(fields, header, 'Order Date');
    if (orderDate && (new Date(orderDate) > new Date(dateString))) {
      return orderDateToISODate(orderDate);
    }
    return null;
  } catch (e) {
    return null;
  }
}

const getLineItem = (fields, header) => {
  return {
    product_url: getProductUrlFromLineItem(fields, header),
    revenue: getPriceFromSales(fields, header)
  };
}

const convertToFront = (row, header) => {
  const entry = {};
  const customerName = getItemFromRow(row, header, 'Customer Name');
  const order_id = getItemFromRow(row, header, 'Order ID');
  const order_date = getISOOrderDateIfAfter(row, header, '7/31/2016');
  const line_items = [ getLineItem(row, header) ];
  return {
    [ customerName ]: {
      orders: [{ order_id, order_date, line_items }]
    }
  };
}

const convertToEntry = (row, header) => {
  try {
    const entry = {};
    const customerName = getItemFromRow(row, header, 'Customer Name');
    const order_id = getItemFromRow(row, header, 'Order ID');
    const order_date = getISOOrderDateIfAfter(row, header, '7/31/2016');
    const line_items = [ getLineItem(row, header) ];
    return {
        [ customerName ]: {
          orders: [{ order_id, order_date, line_items }]
        }
    };
  } catch(e) {
    return e;
  }
}

/**
 * if Customer Name is invalid, throw customer name error
 * @return { Object } if errors, it returns an error object 
 */

// TODO: Refactor to not mutate state, but collect and dedupe instead -- need a good way of merging arrays of nested objects
const createOrMergeEntries = (header, item, data) => {
  try {
    const key = Object.keys(item)[0]; // will only ever be one here, as the key is the actual Customer Name string
    if (!key) throw new CustomerNameError(CUSTOMER_NAME_ERROR, 500, -1);
    const entry = data[key];
      if (entry) {
        for (let order of entry.orders) {
          const check = item[key].orders[0];
          if (order.order_id !== check.order_id) {
            entry.orders.push(check);
            break;
          } else {
            order.line_items.push(check.line_items[0]);
          }
        }
      } else {
        data[key] = item[key];
      }
  }catch(e) {
    return e;
  }
}

const getOrderData = (lines, header) => {
  const data = {};
  const items = _.tail(lines)
    .map(row => row.split('\t'))
    .filter(row => getISOOrderDateIfAfter(row, header, '7/31/2016'))
    .map(row => convertToEntry(row, header))
    .map(item => createOrMergeEntries(header, item, data));
  return data;
}

const parseAsString = async (content) => {
  try {
    const lines = content.split('\n');
    const header = lines[0].split('\t');
    const json = getOrderData(lines, header);
    return json;
  } catch (e) {
    console.error('Error Parsing File: ', e.message);
  }
}

const parseAsFile = async (filename) => {
  try {
    const data = await fs.readFile(filename, { encoding: 'utf-8' });
    const lines = data.split('\n');
    const header = lines[0].split('\t');
    let json = getOrderData(lines, header);
    return convertObjToArray(json);
  } catch (e) {
    console.error('Error Parsing File: ', e.message);
  }
}

/**
 * Conver tsv file data to an array of order object data
 * @function parseAsTable
 * @param { String } path relative file path
 * @returns { Array } an array of tsv object contains order information
 * e.g. [{
    Row ID: "1",
    Order ID: "CA-2016-152156",
    ,..}, { Row ID: "2",
    Order ID: "CA-2016-152157",
    ,..} .. ]
 */
const parseAsTable = async path => {
  try {
    const data = await fs.readFile(path, { encoding: 'utf-8' });
    const lines = data.split('\n');
    const line = lines.map(row => row.split('\t'));
    const header = lines[0].split('\t');
    const content = line.splice(1, line.length - 2);
    const json = content.map(items => {
      return items.reduce((entry, item, idx) => {
          entry[header[idx]] = item;
          return entry;
      }, {});
    })
    return json;
  } catch (e) {
    console.error('Error Parsing File: ', e.message);
  }
}

/**
 * convert a file relative path to a absolute path
 * @function getFilePath   
 * @param { String } FILE_PATH if FILE_PATH is null, return the default path in Constaints
 * @returns { String }
 */
const getFilePath = (FILE_PATH) => {
  const PATH = FILE_PATH || CONSTANTS.FILE_PALTH;
  const position = path.resolve(__dirname, PATH);
  return position;
}

/**
 * give an array of selected keys, return an filtered object by thoes keys
 * @function filterObjByKey
 * @param { Object } rawObj
 * @param { Array } selectedKeys 
 * @returns an filtered object 
 */

const filterObjByKey = (rawObj, selectedKeys) => {
  return Object.keys(rawObj)
      .filter(key => selectedKeys.includes(key))
      .reduce((obj, key) => {
        obj[key] = rawObj[key];
        return obj;
      }, {});
}

/**
 * get list of products by product id in all orders
 * @function getProductsByProductId
 * @param { Object } tableData 
 * @param { String } productId 
 * @return { Array } list of prodcuts in all orders 
 */

/**
 * Get the order object by order id
 * @function getOrderByAnOrderId
 * @param { Object } data data from parseAsFile
 * @param { String } orderId 
 * @returns { Object } an order object
 */

const getOrderByAnOrderId = (data, orderId) => {
  return _.flattenDeep(data.reduce((res, orderObjs) => {
     return Object.values(orderObjs).map(orderObj => {
       const order = orderObj.orders.find(order => order.order_id === orderId);
       res = order ? orderObjs : res;
       return res; 
     });
   }, {}));
}

/**
 * Get filterd prodcut object by order id to display on first modal  
 * @function getPrdocutByOrderId
 * @param { Object } tableData data from parseAsTable
 * @param { String } orderId 
 * @returns { Array } array of prodcut object
 */

const getPrdocutByOrderId = (tableData, orderId) => {
   return tableData.filter(productObj => productObj['Order ID'] === orderId)
   .map(product => filterObjByKey(product, CONSTANTS.SELECTED_PRODUCT_KEYS));
}

/**
 * convert result from parseAsFile to an array type
 * e.g. convert {{Claire Gute: orders:[]...}, {Andrew Allen: orders:[]...}}
 * to [{Claire Gute: orders:[]...}, {Andrew Allen: orders:[]...}]
 * @function convertObjToArray
 * @param { Object } objCollection 
 * @return { Array }
 */

const convertObjToArray = objCollection => {
  return  Object.entries(objCollection).reduce((acc, entry) => {
    acc = [...acc, { [entry[0]] : entry[1]}]
   return acc;
  }, []);
}

module.exports = { 
  parseAsFile,
  getFilePath,
  parseAsTable,
  parseAsString,
  convertObjToArray,
  orderDateToISODate,
  getOrderByAnOrderId,
  getPrdocutByOrderId,
  getISOOrderDateIfAfter,
};
