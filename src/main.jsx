import React from "react";
import ReactDOM from "react-dom/client";
import { NhostProvider } from "@nhost/react";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { nhost } from "./utils/nhost";
import App from "./App";

// ✅ Configure Apollo Client
const client = new ApolloClient({
  uri: "https://klpijmurocgeqhmnqmpq.graphql.ap-south-1.nhost.run/v1", // Replace with actual Nhost GraphQL URL
  cache: new InMemoryCache(),
  headers: {
    "x-hasura-admin-secret": "&*e0h45GKSaK,+Bg$Os0osS2^9Vz^VC$", // Replace with your Hasura admin secret (if required)
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </NhostProvider>
  </React.StrictMode>
);
