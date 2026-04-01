import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { UserProfileEntity } from "./entities.js";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const table = (Resource as any).Table.name;

UserProfileEntity.setClient(docClient);
UserProfileEntity.setTableName(table);

export const UserProfile = UserProfileEntity;
export { docClient, table };
