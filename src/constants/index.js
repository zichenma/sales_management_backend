const CONSTANTS = {
    FILE_PALTH : '../data/sampledata.tsv',
    BASE_URL : (process.env.NODE_ENV === 'dev') ?  'http://localhost:3000' : 'https://sales-management-zm.herokuapp.com',
    SELECTED_PRODUCT_KEYS : ['Order ID', 'Product Name', 'Order Date', 'Sales', 'Quantity']
};

module.exports = CONSTANTS;