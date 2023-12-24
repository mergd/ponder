import { ponder } from "@/generated";
import { zeroAddress } from "viem";

ponder.on("ERC4626:Transfer", async ({ event, context }) => {
  const { Account, TransferEvent } = context.db;

  // Create an Account for the sender, or update the balance if it already exists.
  await Account.upsert({
    id: event.args.from,
  });
  // Create an Account for the receiver, or update if needed
  await Account.upsert({
    id: event.args.to,
  });

  // Update the token
  await TransferEvent.create({
    id: event.log.id,
    data: {
      fromId: event.args.from,
      toId: event.args.to,
      value: event.args.amount,
      timestamp: Number(event.block.timestamp),
    },
  });
});

ponder.on("ERC4626:Deposit", async ({ event, context }) => {
  const { Account, DepositEvent, TransferEvent, ExchangeRate, Vault } =
    context.db;

  // Create an Account for the depositor, or update the balance if it already exists.
  await Account.upsert({
    id: event.args.caller,
  });

  // Create an Account for the deposit recipient, or update the balance if it already exists.
  await Account.upsert({
    id: event.args.owner,
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
  const { Account, WithdrawEvent, ExchangeRate, Vault } = context.db;

  // Create an Account for the account triggering the withdraw, or update the balance if it already exists.
  await Account.upsert({
    id: event.args.caller,
  });

  // Create an Account for the asset recipient, or update the balance if it already exists.
  await Account.upsert({
    id: event.args.owner,
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
