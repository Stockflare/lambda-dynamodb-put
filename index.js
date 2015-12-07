// dependencies
var AWS = require('aws-sdk');
var _ = require('underscore');
var When = require('when');
var async = require('async');

exports.handler = function(event, context) {
  console.log(JSON.stringify(event, null, 2));

  var saveItem = function(dynamodb, region, payload, callback) {
    async.retry({times: 20, interval: 1000}, function(db_callback){
      console.log("trying save in retry block");
      dynamodb.putItem(payload, function(err, data){
        if (err) {
          // console.log(err);
          db_callback(err, null);
        } else {
          db_callback(null, data);
        }
      });
    }, callback);

  };

  // Create promises for each record that m,ust be processed
  var promises = event.Records.map(function(record){
    return When.promise(function(resolve, reject, notify) {
      // base64 decode, convert to utf8 and JSON parse this kinesis record's payload
      var text = new Buffer(record.kinesis.data, 'base64').toString('utf8');
      // console.log(text);
      var payload = JSON.parse(text);
      console.log(payload);
      var region = record.awsRegion;

      // Put the payload into dynamodb
      var dynamodb = new AWS.DynamoDB({region: region});
      saveItem(dynamodb, region, payload, function(err, data){
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
    console.log("Successfully processed " + event.Records.length + " records.");
    context.succeed("Successfully processed " + event.Records.length + " records.");
  }, function(reason) {
    console.log("Failed to process records " + reason);
    context.fail("Failed to process records " + reason);
  });


};
