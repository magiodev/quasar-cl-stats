# Quasar Subgraph Query Examples

In this document, we will walk through a GraphQL query example for the Quasar Subgraph.

The example demonstrates how to fetch data about a specific block from the Quasar blockchain using its ID.

```graphql
{
    block(id: "1") {
        id
        header {
            id
            chainId
            height
            lastCommitHash
            dataHash
            validatorsHash
            nextValidatorsHash
            consensusHash
            appHash
            lastResultsHash
            evidenceHash
            proposerAddress
            hash
        }
    }
}
```