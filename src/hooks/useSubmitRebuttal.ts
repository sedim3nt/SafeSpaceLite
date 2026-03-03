import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { keccak256, encodePacked } from 'viem';
import { SafeSpaceRegistryABI, SAFESPACE_REGISTRY_ADDRESS } from '../lib/contracts';
import { normalizeAddress } from '../lib/normalizeAddress';

interface SubmitRebuttalArgs {
  propertyAddress: string;
  reportIndex: number;
  rebuttalText: string;
}

export function useSubmitRebuttal() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Read the current fee from the contract
  const { data: rebuttalFee } = useReadContract({
    address: SAFESPACE_REGISTRY_ADDRESS,
    abi: SafeSpaceRegistryABI,
    functionName: 'rebuttalFee',
  });

  const submitRebuttal = ({ propertyAddress, reportIndex, rebuttalText }: SubmitRebuttalArgs) => {
    if (!rebuttalFee) return;

    const normalized = normalizeAddress(propertyAddress);
    const propertyHash = keccak256(encodePacked(['string'], [normalized]));

    // MVP: store rebuttal text directly as arweaveHash field
    // Production: upload to Arweave first, use the returned tx hash
    const rebuttalPayload = JSON.stringify({
      text: rebuttalText,
      timestamp: Date.now(),
    });

    writeContract({
      address: SAFESPACE_REGISTRY_ADDRESS,
      abi: SafeSpaceRegistryABI,
      functionName: 'submitRebuttal',
      args: [propertyHash, BigInt(reportIndex), rebuttalPayload],
      value: rebuttalFee,
    });
  };

  return {
    submitRebuttal,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    rebuttalFee,
  };
}
