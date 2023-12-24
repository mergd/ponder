import { createConfig } from "@ponder/core";
import { erc4626ABI } from "@wagmi/core";
import { http } from "viem";

export default createConfig({
  networks: {
    mainnet: {
      chainId: 1,
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    ERC721: {
      network: "mainnet",
      abi: erc4626ABI,
      address: "0x2b95A1Dcc3D405535f9ed33c219ab38E8d7e0884",
      startBlock: 18755367,
      endBlock: 18795367,
    },
  },
});
