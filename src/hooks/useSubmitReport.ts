import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, encodePacked } from 'viem';
import { SafeSpaceRegistryABI, SAFESPACE_REGISTRY_ADDRESS, IssueTypeMap } from '../lib/contracts';
import { normalizeAddress } from '../lib/normalizeAddress';

interface SubmitReportArgs {
  propertyAddress: string;
  issueType: string;
  severity: number;
  /** For MVP: a content hash or placeholder string. Will be an Arweave tx hash in production. */
  arweaveHash: string;
}

export function useSubmitReport() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const submitReport = ({
    propertyAddress,
    issueType,
    severity,
    arweaveHash,
  }: SubmitReportArgs) => {
    const normalized = normalizeAddress(propertyAddress);
    const propertyHash = keccak256(encodePacked(['string'], [normalized]));

    writeContract({
      address: SAFESPACE_REGISTRY_ADDRESS,
      abi: SafeSpaceRegistryABI,
      functionName: 'submitReport',
      args: [propertyHash, IssueTypeMap[issueType] ?? 8, severity, arweaveHash],
    });
  };

  return {
    submitReport,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
