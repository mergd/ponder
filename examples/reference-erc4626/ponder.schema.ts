import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Vault: p.createTable({
    timestamp: p.int(),
    deposits: p.bigint(),
    shares: p.bigint(),
  }),

  Account: p.createTable({
    id: p.bytes(),
    balance: p.bigint(),
  }),

  DepositEvent: p.createTable({
    id: p.string(),
    timestamp: p.int(),
    ownerId: p.bytes().references("Account.id"),
    fromId: p.bytes().references("Account.id"),

    from: p.one("Account.id"),
    owner: p.one("Account.id"),

    assets: p.bigint(),
    shares: p.bigint(),
  }),
  WithdrawEvent: p.createTable({
    id: p.string(),
    timestamp: p.int(),
    ownerId: p.bytes().references("Account.id"),
    fromId: p.bytes().references("Account.id"),

    from: p.one("Account.id"),
    owner: p.one("Account.id"),

    assets: p.bigint(),
    shares: p.bigint(),
  }),
  ExchangeRate: p.createTable({
    timestamp: p.int(),
    rate: p.bigint(),
  }),
}));
