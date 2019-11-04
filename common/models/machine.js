'use strict';

module.exports = function(Machine) {

  Machine.upload = async (file) => {
    console.log('data ', file);
    return '';
  };

  Machine.remoteMethod('upload', {
    accepts: {arg: 'file', type: 'file', http: { source: 'body'}}
  });
};
