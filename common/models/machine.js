'use strict';

const ExcelJs = require('exceljs');

module.exports = function(Machine) {
  // Machine.disableRemoteMethodByName('deleteById', true);
  // Machine.disableRemoteMethodByName('create', true);
  // Machine.disableRemoteMethodByName('upsert', true);

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

  Machine.download = async (req, res) => {
    const workbook = new ExcelJs.Workbook();
    const records = await Machine.find({ order: 'attribute DESC', fields: { id: false }});
    
    const worksheet = workbook.addWorksheet('Sheet');

    worksheet.columns = [
      { header: 'Machine', key: 'machine', width: '10'},
      { header: 'Attribute', key: 'attribute', width: '10'},
      { header: 'Reading', key: 'reading', width: '10', type: 'decimal'}
    ];

    records.forEach(({ machine, attribute, reading }) => {
      // addRow and parse reading to number
      worksheet.addRow({ machine, attribute, reading: parseFloat(reading.replace(/,/g, '')) });
    });

    res.attachment('download.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }

  Machine.remoteMethod('upload', {
    accepts: [
      {arg: 'req', type: 'object', http: { source: 'req'}},
      {arg: 'res', type: 'object', http: { source: 'res'}},
    ]
  });

  Machine.remoteMethod('download', {
    accepts: [
      {arg: 'req', type: 'object', http: { source: 'req'}},
      {arg: 'res', type: 'object', http: { source: 'res'}},
    ],
    http: {'verb': 'get'}
  });
};
