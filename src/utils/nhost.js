// import { NhostClient } from '@nhost/nhost-js';

// const nhost = new NhostClient({
//   subdomain: 'klpijmurocgeqhmnqmpq', // Replace with your actual subdomain
//   region: 'ap-south-1', // Replace with your actual region
// });

// export { nhost };
import { NhostClient } from '@nhost/react';

export const nhost = new NhostClient({
  authUrl: import.meta.env.VITE_NHOST_AUTH_URL,
  graphqlUrl: import.meta.env.VITE_NHOST_GRAPHQL_URL,
  storageUrl: import.meta.env.VITE_NHOST_STORAGE_URL,
  functionsUrl: import.meta.env.VITE_NHOST_FUNCTIONS_URL
});
