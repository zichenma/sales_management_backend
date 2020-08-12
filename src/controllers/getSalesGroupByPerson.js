const { parseAsFile, getFilePath } = require('../utils/tsv2json');

const getSalesGroupByPerson = async (req, res) => {
    const position = getFilePath();
    try {
      const data = await parseAsFile(position);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};


module.exports = getSalesGroupByPerson;