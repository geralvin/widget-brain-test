'use strict';

const ExcelJs = require('exceljs');

module.exports = function(Machine) {

  Machine.upload = async (req, res) => {
    const workbook = new ExcelJs.Workbook();

    try {
      const buf = Buffer(req.files.file.data);
      workbook.xlsx.load(buf)
      .then(() => {
        const worksheet = workbook.getWorksheet(1);
        worksheet.eachRow({includeEmpty: false}, async function(row, rowNumber) {
          if (rowNumber !== 1) {
            // proceed data
            const [_, machine, attribute, reading] = row.values;
            const record = await Machine.findOne({ where: { machine, attribute }});

            if (record) {
              // replace if record is found
              await Machine.replaceById(record.id, { machine, attribute, reading });
            } else {
              // otherwise insert new record
              await Machine.upsert({ machine, attribute, reading });
            }
          }
        });
      });

      return res.status(201);
    } catch(err) {
      throw err;
    }
  };

  Machine.remoteMethod('upload', {
    accepts: [
      {arg: 'req', type: 'object', http: { source: 'req'}},
      {arg: 'res', type: 'object', http: { source: 'res'}},
    ]
  });
};
