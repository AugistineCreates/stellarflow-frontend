"use client";

import React, { useState } from "react";
import { CorridorStatusMap, FxRateTicker, FxComparisonTable, FiatOnRampModal, SEP24InteractiveModal, type RemittanceCorridor } from "@/components/remittance";
import { useOptionalWallet, useOptionalWalletActions } from "@/app/components/providers/WalletProvider";
import { ArrowDownToLine, ArrowUpFromLine, CreditCard } from "lucide-react";
import type { SEP24Operation } from "@/lib/sep24Interactive";

export default function RemittancePage() {
  const walletState = useOptionalWallet();
  const walletActions = useOptionalWalletActions();
  const wallet = walletState?.wallet;
  const [isOnRampOpen, setIsOnRampOpen] = useState(false);
  const [isSEP24Open, setIsSEP24Open] = useState(false);
  const [sep24Operation, setSEP24Operation] = useState<SEP24Operation>("deposit");
  const [selectedCorridor, setSelectedCorridor] = useState<RemittanceCorridor | null>(null);

  const walletAddress = wallet?.publicKey || "";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-sans">
      <div className="mb-8 border-b border-neutral-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Remittance & FX Corridors
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Live fiat conversion rates and a fee comparison against traditional money transfer
            operators for StellarFlow&apos;s cross-border remittance corridors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!walletAddress) {
                alert("Please connect your Stellar wallet first to fund your account.");
                return;
              }
              setIsOnRampOpen(true);
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-violet-500 active:scale-95"
          >
            <CreditCard size={18} />
            <span>Fund Account</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSEP24Operation("deposit");
              setIsSEP24Open(true);
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-lime-300/25 bg-lime-300/[0.07] px-4 text-sm font-medium text-lime-200 transition-colors hover:bg-lime-300/15"
          >
            <ArrowDownToLine size={17} /> SEP-24 Deposit
          </button>
          <button
            type="button"
            onClick={() => {
              setSEP24Operation("withdrawal");
              setIsSEP24Open(true);
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/5"
          >
            <ArrowUpFromLine size={17} /> SEP-24 Withdraw
          </button>
        </div>
      </div>

      {selectedCorridor && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-400/30 bg-blue-400/10 p-4">
          <p className="text-sm text-blue-100">Remittance wizard ready for <strong>{selectedCorridor.destinationCountry}</strong>. Continue to choose funding and payout details.</p>
          <button type="button" onClick={() => setIsOnRampOpen(true)} className="rounded-lg bg-blue-400 px-3 py-2 text-sm font-semibold text-neutral-950 hover:bg-blue-300">Continue transfer</button>
        </div>
      )}

      <div className="mb-6">
        <CorridorStatusMap onCorridorSelect={setSelectedCorridor} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl-grid-cols-3">
        <div className="xl-col-span-1">
          <FxRateTicker />
        </div>
        <div className="xl-col-span-2">
          <FxComparisonTable />
        </div>
      </div>

      {isOnRampOpen && walletAddress && (
        <FiatOnRampModal
          isOpen={isOnRampOpen}
          onClose={() => setIsOnRampOpen(false)}
          walletAddress={walletAddress}
          assetCode="XLM"
          onRefreshBalance={async () => {
            await walletActions?.refreshWalletState();
          }}
        />
      )}
      <SEP24InteractiveModal
        isOpen={isSEP24Open}
        onClose={() => setIsSEP24Open(false)}
        account={walletAddress}
        assetCode="XLM"
        initialOperation={sep24Operation}
        onRefresh={async () => {
          await walletActions?.refreshWalletState();
        }}
      />
    </div>
  );
}

