// dependencies
var AWS = require('aws-sdk');
var _ = require('underscore');
var When = require('when');

exports.handler = function(event, context) {
  // console.log(JSON.stringify(event, null, 2));

  var promises = event.Records.map(function(record){
    return When.promise(function(resolve, reject, notify) {
      // base64 decode, convert to ascii and JSON parse this kinesis record's payload
      var text = new Buffer(record.kinesis.data, 'base64').toString('utf8');
      // console.log(text);
      var payload = JSON.parse(text);
      console.log(payload);
      var region = record.awsRegion;

      // Put the payload into dynamodb
      var dynamodb = new AWS.DynamoDB({region: region});
      dynamodb.putItem(payload, function(err, data){
        if (err) {
          console.log(JSON.stringify(err));
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  });


  When.all(promises).done(function(records) {
    context.succeed("Successfully processed " + event.Records.length + " records.");
  }, function(reason) {
    context.fail("Failed to process records " + reason);
  });


};
