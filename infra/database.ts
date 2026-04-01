// DynamoDB single-table design
export const table = new sst.aws.Dynamo("Table", {
  fields: {
    PK: "string",
    SK: "string",
    GSI1PK: "string",
    GSI1SK: "string",
  },
  primaryIndex: { hashKey: "PK", rangeKey: "SK" },
  globalIndexes: {
    gsi1: { hashKey: "GSI1PK", rangeKey: "GSI1SK" },
  },
});
