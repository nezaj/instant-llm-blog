import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    posts: i.entity({
      title: i.string(),
      content: i.string(),
      updatedAt: i.date().indexed()
    }),
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema { }
const schema: AppSchema = _schema;

export { type AppSchema };
export default schema;
