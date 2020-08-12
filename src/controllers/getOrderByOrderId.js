const { 
    getFilePath, 
    parseAsFile, 
    getOrderByAnOrderId,
} = require('../utils/tsv2json');


const getOrderByOrderId = async (req, res) => {
  const { orderId } = req.params;
  const position = getFilePath();
    try {
      const orderData = await parseAsFile(position);
      const order = getOrderByAnOrderId(orderData, orderId);
      return res.json(order);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};


module.exports = getOrderByOrderId;