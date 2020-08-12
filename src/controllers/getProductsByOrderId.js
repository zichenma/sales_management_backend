const { 
    getFilePath, 
    parseAsTable, 
    getPrdocutByOrderId,
} = require('../utils/tsv2json');

const getProductsByOrderId = async (req, res) => {
  const { orderId } = req.params;
  console.log(req.params)
  const position = getFilePath();
    try {
      const salesTableData = await parseAsTable(position);
      const products = getPrdocutByOrderId(salesTableData, orderId);
      return res.json({ products });
    } catch (error) {
      return res.status(500).json({ error: 'Error in sampledata.tsv' });
    }
};


module.exports = getProductsByOrderId;