import { useReadContract } from 'wagmi';
import { keccak256, encodePacked } from 'viem';
import { SafeSpaceRegistryABI, SAFESPACE_REGISTRY_ADDRESS } from '../lib/contracts';
import { normalizeAddress } from '../lib/normalizeAddress';

export function usePropertyReports(propertyAddress: string | undefined) {
  const normalized = propertyAddress ? normalizeAddress(propertyAddress) : '';
  const propertyHash = normalized ? keccak256(encodePacked(['string'], [normalized])) : undefined;

  const {
    data: reports,
    isLoading,
    error,
  } = useReadContract({
    address: SAFESPACE_REGISTRY_ADDRESS,
    abi: SafeSpaceRegistryABI,
    functionName: 'getReports',
    args: propertyHash ? [propertyHash] : undefined,
    query: { enabled: !!propertyHash },
  });

  const { data: reportCount } = useReadContract({
    address: SAFESPACE_REGISTRY_ADDRESS,
    abi: SafeSpaceRegistryABI,
    functionName: 'getReportCount',
    args: propertyHash ? [propertyHash] : undefined,
    query: { enabled: !!propertyHash },
  });

  return {
    reports: reports ?? [],
    reportCount: reportCount ? Number(reportCount) : 0,
    isLoading,
    error,
  };
}
