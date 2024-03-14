# Quasar Vaults Statistics Subgraph

This document introduces the Subgraph Node dedicated to indexing and querying data from Quasar CL Vaults on-chain
interactions. Our goal is to provide an intuitive and efficient way for the community to understand and leverage the
valuable data captured from our vault activities.

## What is a Subgraph?

A subgraph is a specialized database designed to index data from a blockchain, making it easily searchable and
queryable. It captures and organizes specific events and transactions, allowing users to retrieve detailed information
about blockchain interactions without needing to scan the entire network.

## Quasar Vaults Stats Subgraph

It focuses on indexing data related to deposits, redeems, and claim rewards in Quasar CL vaults.
It transforms raw blockchain data into a structured format, offering insights into:

- **Total and Active Users:** Track the number of unique users interacting with each vault over time and the active
  participants within a specific period.
- **Interactions Count Per Vault:** Monitor the total number of interactions, providing a clear view of vault activity
  and user
  engagement.
- **Vault Transactions:** Access detailed information on deposits, withdrawals, and reward claims, including the amounts
  and tokens involved.

See the [complete schema](./schema.graphql) for more information about the data we capture.

## Accessing the Subgraph

Our subgraph is accessible via a GraphQL endpoint, a powerful query language that allows you to specify precisely what
data you need. This flexibility ensures efficient data retrieval, enabling you to get insights without unnecessary
overhead.

https://thegraph.com/hosted-service/subgraph/magiodev/quasar-cl-stats

### Local Environment Setup

For those interested in exploring the subgraph data locally, we provide a Docker-based setup:

1. **Docker Installation:** Ensure Docker and Docker Compose are installed on your machine. Docker simplifies the setup
   process by containerizing the application, ensuring consistency across different environments.
2. **Running the Node:** Use `docker-compose up -d` to start the subgraph node. This command runs the services in the
   background, allowing you to continue using your terminal.
3. **Querying Data:** Once the node is running, access the GraphQL interface
   at `http://localhost:8000/subgraphs/name/quasar-cl-stats/graphql` to start querying the data.

### Interacting with the Subgraph

Through the GraphQL endpoint, you can construct queries to retrieve specific data points, such as the total deposits in
a particular vault or the number of unique users over a specific period. The interface is user-friendly, enabling team
members to obtain the information they need without deep blockchain expertise.

## Conclusion

The Vault Interaction Subgraph is a powerful tool for our team, enabling us to analyze and leverage our blockchain data
effectively. By providing a clear and structured view of vault interactions, we empower our team to make informed
decisions and foster innovation within our ecosystem.

Happy exploring, and we look forward to seeing how you'll utilize these insights in your work!