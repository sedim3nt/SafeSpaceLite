import React from 'react';

interface RebuttalCardProps {
  arweaveHash: string;
  timestamp: bigint;
}

export const RebuttalCard: React.FC<RebuttalCardProps> = ({ arweaveHash, timestamp }) => {
  // MVP: arweaveHash contains JSON-encoded rebuttal text
  let rebuttalText = arweaveHash;
  try {
    const parsed = JSON.parse(arweaveHash);
    rebuttalText = parsed.text ?? arweaveHash;
  } catch {
    // If not JSON, display raw string
  }

  return (
    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
      <div className="mb-1 flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
          Landlord Response
        </span>
        <span className="text-xs text-gray-500">
          {new Date(Number(timestamp) * 1000).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-gray-700">{rebuttalText}</p>
    </div>
  );
};
