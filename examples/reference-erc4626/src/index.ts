import { ponder } from "@/generated";

ponder.on("ERC4626:Deposit", async ({ event, context }) => {
  const { Account, Token, DepositEvent, ExchangeRate, Vault } = context.db;

  // Create an Account for the depositor, or update the balance if it already exists.
  await Account.upsert({
    id: event.args.caller,
  });

  // Create an Account for the deposit recipient, or update the balance if it already exists.
  await Account.upsert({
    id: event.args.owner,
  });

  // Update the token
  await Token.upsert({
    id: event.args.tokenId,
    create: {
      ownerId: event.args.to,
    },
    update: {
      ownerId: event.args.to,
    },
  });

  // Update the deposit
  await DepositEvent.create({
    id: event.log.id,
    data: {
      ownerId: event.args.owner,
      fromId: event.args.caller,
      assets: event.args.amount,
      shares: event.args.shares,
      timestamp: Number(event.block.timestamp),
    },
  });

  // Update the exchange rate for this timestamp
  await ExchangeRate.upsert({
    timestamp: Number(event.block.timestamp),
    create: {
      rate: event.args.amount / event.args.shares,
    },
    update: {
      rate: event.args.amount / event.args.shares,
    },
  });
  // Update the vault details
  await Vault.update({
    id: event.args.tokenId,
    create: {
      deposits: event.args.amount,
      shares: event.args.shares,
      timestamp: Number(event.block.timestamp),
    },
    update: ({ current }) => ({
      deposits: current.deposits + event.args.amount,
      shares: current.shares + event.args.shares,
      timestamp: Number(event.block.timestamp),
    }),
  });
});
ponder.on("ERC4626:Withdraw", async ({ event, context }) => {
  const { Account, Token, WithdrawEvent, ExchangeRate, Vault } = context.db;

  // Create an Account for the account triggering the withdraw, or update the balance if it already exists.
  await Account.upsert({
    id: event.args.caller,
  });

  // Create an Account for the asset recipient, or update the balance if it already exists.
  await Account.upsert({
    id: event.args.owner,
  });

  // Update the token
  await Token.upsert({
    id: event.args.tokenId,
    create: {
      ownerId: event.args.to,
    },
    update: {
      ownerId: event.args.to,
    },
  });

  // Update the Withdraw
  await WithdrawEvent.create({
    id: event.log.id,
    data: {
      ownerId: event.args.owner,
      fromId: event.args.caller,
      assets: event.args.amount,
      shares: event.args.shares,
      timestamp: Number(event.block.timestamp),
    },
  });

  // Update the exchange rate for this timestamp
  await ExchangeRate.upsert({
    timestamp: Number(event.block.timestamp),
    create: {
      rate: event.args.amount / event.args.shares,
    },
    update: {
      rate: event.args.amount / event.args.shares,
    },
  });

  // Update the vault details
  await Vault.update({
    id: event.args.tokenId,
    create: {
      deposits: event.args.amount,
      shares: event.args.shares,
      timestamp: Number(event.block.timestamp),
    },
    update: ({ current }) => ({
      deposits: current.deposits - event.args.amount,
      shares: current.shares - event.args.shares,
      timestamp: Number(event.block.timestamp),
    }),
  });
});
