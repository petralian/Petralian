import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: 'c0ab8dbd192dd51b32533e26f0acd7618e0c457e', queries,  });
export default client;
  