'use strict';

const ExcelJs = require('exceljs');

const workbook = new ExcelJs.Workbook();

const readExcel = (path) => {
  workbook.xlsx.readFile(path)
  .then(() => {
    const worksheet = workbook.getWorksheet(1);
    worksheet.eachRow({includeEmpty: false}, function(row, rowNumber) {
      console.log(JSON.stringify(row.values));
    });
  })
  .catch(err => {
    console.log(err);
  });
};

readExcel('./initial.xlsx');