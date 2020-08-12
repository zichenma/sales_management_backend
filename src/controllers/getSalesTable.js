const { parseAsTable, getFilePath } = require('../utils/tsv2json');


const getSalesTable = async (req, res) => {
    const position = getFilePath();
    try {
      const data = await parseAsTable(position);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Error in sampledata.tsv' });
    }
};


module.exports = getSalesTable;