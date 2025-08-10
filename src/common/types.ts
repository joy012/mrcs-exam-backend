import { Pattern } from 'typia/lib/tags';

export type MongoId = string & Pattern<'^[0-9a-fA-F]{24}$'>;
