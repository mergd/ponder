# Example ERC721 token API

This example shows how to create a GraphQL API for an ERC4626 token using Ponder. It uses the Smol Brains NFT contract on Arbitrum.

## Sample queries

### Get all tokens currently owned by an account

```graphql
{
  account(id: "0x2b95A1Dcc3D405535f9ed33c219ab38E8d7e0884") {
    id
    tokens {
      id
    }
  }
}
```

### Get the current owner and all transfer events for a token

```graphql
{
  token(id: "7777") {
    owner {
      id
    }
    transferEvents {
      from
      to
      timestamp
    }
  }
}
```
