import { useReadContract } from 'wagmi';
import { keccak256, encodePacked } from 'viem';
import { SafeSpaceRegistryABI, SAFESPACE_REGISTRY_ADDRESS } from '../lib/contracts';
import { normalizeAddress } from '../lib/normalizeAddress';

export function useRebuttal(propertyAddress: string | undefined, reportIndex: number) {
  const normalized = propertyAddress ? normalizeAddress(propertyAddress) : '';
  const propertyHash = normalized ? keccak256(encodePacked(['string'], [normalized])) : undefined;

  const { data: exists } = useReadContract({
    address: SAFESPACE_REGISTRY_ADDRESS,
    abi: SafeSpaceRegistryABI,
    functionName: 'hasRebuttal',
    args: propertyHash ? [propertyHash, BigInt(reportIndex)] : undefined,
    query: { enabled: !!propertyHash },
  });

  const { data: rebuttal, isLoading } = useReadContract({
    address: SAFESPACE_REGISTRY_ADDRESS,
    abi: SafeSpaceRegistryABI,
    functionName: 'getRebuttal',
    args: propertyHash ? [propertyHash, BigInt(reportIndex)] : undefined,
    query: { enabled: !!propertyHash && exists === true },
  });

  return {
    hasRebuttal: exists ?? false,
    rebuttal: rebuttal ?? null,
    isLoading,
  };
}
