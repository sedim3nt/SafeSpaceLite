import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

export const ConnectWallet: React.FC = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) {
    return null;
  }

  if (authenticated) {
    const displayName =
      user?.email?.address ?? user?.google?.email ?? user?.apple?.email ?? 'Connected';

    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-gray-600 sm:inline">{displayName}</span>
        <button
          onClick={logout}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-sm font-medium text-white"
    >
      Sign In
    </button>
  );
};
