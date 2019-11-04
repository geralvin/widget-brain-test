'use strict';

const ExcelJs = require('exceljs');
const workbook = new ExcelJs.Workbook();

module.exports = function(Machine) {

  Machine.upload = async (req, res) => {
    try {
      const buf = Buffer(req.files.file.data);
      workbook.xlsx.load(buf)
      .then(() => {
        const worksheet = workbook.getWorksheet(1);
        worksheet.eachRow({includeEmpty: false}, function(row, rowNumber) {
          if (rowNumber !== 1) {
            // proceed data
            const [_, machine, attribute, reading] = row.values;
            Machine.upsertWithWhere({where: { machine }}, { machine, attribute, reading });
          }
        });
      });

    return '';
    } catch(err) {
      throw err;
    }
  };

  Machine.remoteMethod('upload', {
    accepts: {arg: 'req', type: 'object', http: { source: 'req'}}
  });
};
