# Lambda DynamoDB Put

A Lambda Function to provide a Kinesis Stream endpoint to write data in DynamoDB tables.

This function is primary used by https://github.com/Stockflare/dynamodb-restore.  The restore script will send place DynamoDB put request payloads onto the stream.  This function when launched by the Kinesis stream Event Source will execute the DynamoDB put requests.

The shard facility of Kinesis in combination with Lambda allows the DynamoDB put operations to be executed in parallel, with good error handling and very high scalability of throughput.

https://github.com/Stockflare/worker-dynamic-dynamodb is expected to be running in order to automatically scale the provisioned throughput of the target DynamoDB tables.

## Example Kinesis data payload
Kinesis Base64 encodes all data payloads, an example expected payload is shown below
```
{
  TableName: <table_name>,
  Item: {"updated_at"=>{"N"=>"1447203612"}, "id"=>{"S"=>"bnpkOnVzZA==\n"}, "rate"=>{"N"=>"0.6550358501120767"}}
}
```

A Sample Kinesis event in shown in `events/insert.json`

## DynamoDB throughput provisioning
A single https://github.com/Stockflare/dynamodb-restore process pushing to a 10 shard Kinesis stream from outside the AWS VPC has been shown to require a provisioned write throughput of 130 on the DynamoDB table.  It is recommended that you bump up the throughput prior to starting a restore process.

A complete restore of 50K records took around 4 minutes.
