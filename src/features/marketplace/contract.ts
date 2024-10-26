import {useAddRecentTransaction} from '@rainbow-me/rainbowkit';
import {creditsNftAbi} from './abi';
import {
  useConfig,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import {formatEther} from 'viem';
import {waitForTransactionReceipt} from 'wagmi/actions';

export function useMarketplaceContract({
  contractAddress,
}: {
  contractAddress: `0x${string}`;
}) {
  const listedTokens = useReadContract({
    address: contractAddress,
    abi: creditsNftAbi,
    functionName: 'listAvailable',
    args: [],
  });

  console.debug({listedTokens: listedTokens.data, error: listedTokens.error});
  return {listedTokens};
}

export function useTokenModel({
  contractAddress,
  tokenId,
}: {
  contractAddress: `0x${string}`;
  tokenId: string | number;
}) {
  const addRecentTransaction = useAddRecentTransaction();

  const buyWrite = useWriteContract();
  const listWrite = useWriteContract();
  const unlistWrite = useWriteContract();

  const config = useConfig();

  const tokenPrice = useReadContract({
    address: contractAddress,
    abi: creditsNftAbi,
    functionName: 'getTokenPrice',
    args: [BigInt(tokenId)],
  });

  const tokenText = useReadContract({
    address: contractAddress,
    abi: creditsNftAbi,
    functionName: 'getText',
    args: [BigInt(tokenId)],
  });

  const buy = async () => {
    if (buyWrite.isPending) return;

    if (!tokenPrice.isSuccess || !tokenText.isSuccess) {
      // avoid crashes
      return;
    }

    const tx = await buyWrite.writeContractAsync({
      address: contractAddress,
      abi: creditsNftAbi,
      functionName: 'buyAvailable',
      args: [BigInt(tokenId)],
      value: tokenPrice.data,
    });

    return tx;
  };

  const list = async (price: bigint) => {
    console.debug('doing list');

    if (listWrite.isPending) return;

    console.debug({price});

    const txHash = await listWrite.writeContractAsync({
      address: contractAddress,
      abi: creditsNftAbi,
      functionName: 'listToMarket',
      args: [BigInt(tokenId), price],
    });

    addRecentTransaction({
      hash: txHash,
      description: `Listed ${tokenId} for sale at ${formatEther(price)}`,
    });

    waitForTransactionReceipt(config, {
      hash: txHash,
      confirmations: 3,
    }).then(() => {
      tokenPrice.refetch();
    });

    return txHash;
  };

  const unlist = async () => {
    if (unlistWrite.isPending) return;

    if (!tokenPrice.isSuccess || !tokenText.isSuccess) {
      // avoid crashes
      return;
    }

    const txHash = await unlistWrite.writeContractAsync({
      address: contractAddress,
      abi: creditsNftAbi,
      functionName: 'unlistFromMarket',
      args: [BigInt(tokenId)],
    });

    addRecentTransaction({
      hash: txHash,
      description: `Unlisted ${tokenId} from sale`,
    });

    waitForTransactionReceipt(config, {
      hash: txHash,
      confirmations: 3,
    }).then(() => {
      tokenPrice.refetch();
    });
    return txHash;
  };

  return {
    buyWrite,
    buy,
    list,
    unlist,
    tokenPrice,
    tokenText,
    isListedForSale: tokenPrice.isSuccess,
  };
}
