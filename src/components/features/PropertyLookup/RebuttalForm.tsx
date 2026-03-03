import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { formatEther } from 'viem';
import { Button, Card } from '../../common';
import { Textarea } from '../../common/Form';
import { useSubmitRebuttal } from '../../../hooks';
import { ConnectWallet } from '../Wallet/ConnectWallet';

interface RebuttalFormProps {
  propertyAddress: string;
  reportIndex: number;
  onSuccess?: () => void;
}

export const RebuttalForm: React.FC<RebuttalFormProps> = ({
  propertyAddress,
  reportIndex,
  onSuccess,
}) => {
  const { authenticated } = usePrivy();
  const { submitRebuttal, isPending, isConfirming, isSuccess, error, rebuttalFee } =
    useSubmitRebuttal();

  const [rebuttalText, setRebuttalText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setRebuttalText('');
      setIsOpen(false);
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  const feeDisplay = rebuttalFee ? `$10 (${formatEther(rebuttalFee)} ETH)` : '$10';

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-800"
      >
        Are you the landlord? Submit a response ({feeDisplay})
      </button>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rebuttalText.trim()) return;
    submitRebuttal({
      propertyAddress,
      reportIndex,
      rebuttalText: rebuttalText.trim(),
    });
  };

  return (
    <Card className="mt-3 border-amber-200 bg-amber-50">
      <form onSubmit={handleSubmit} className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Landlord Response</h4>
        <p className="text-xs text-gray-600">
          Your response will be displayed permanently alongside this report. Fee: {feeDisplay}
        </p>

        <Textarea
          label=""
          value={rebuttalText}
          onChange={(e) => setRebuttalText(e.target.value)}
          placeholder="Provide your response to this report..."
          rows={4}
          required
        />

        {error && (
          <p className="text-xs text-red-600">
            {error.message.split('\n')[0]}
          </p>
        )}

        {isPending && (
          <p className="text-xs text-yellow-700">Confirming your response...</p>
        )}

        {isConfirming && (
          <p className="text-xs text-blue-700">Recording your response...</p>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          {!authenticated ? (
            <ConnectWallet />
          ) : (
            <Button type="submit" disabled={isPending || isConfirming || !rebuttalText.trim()}>
              {isPending ? 'Confirming...' : isConfirming ? 'Submitting...' : `Submit Response (${feeDisplay})`}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};
