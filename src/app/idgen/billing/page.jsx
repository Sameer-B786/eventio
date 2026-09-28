"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function BillingPage() {
  const searchParams = useSearchParams();
  const txn = searchParams.get('txn');
  
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(null);
  const [txnStatus, setTxnStatus] = useState(null); // 'SUCCESS', 'FAILED', 'PENDING'

  useEffect(() => {
    // Fetch current wallet balance
    fetch('/api/credits/balance')
      .then(r => r.json())
      .then(data => setCredits(data.credits))
      .catch(console.error);

    // If returning from PhonePe, check status
    if (txn) {
      checkTransactionStatus(txn);
    }
  }, [txn]);

  const checkTransactionStatus = async (transactionId) => {
    try {
      const res = await fetch(`/api/payments/phonepe/status/${transactionId}`);
      const data = await res.json();
      if (data.status === 'COMPLETED') {
        setTxnStatus('SUCCESS');
      } else if (data.status === 'FAILED') {
        setTxnStatus('FAILED');
      } else {
        setTxnStatus('PENDING');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuyCredits = async (bundleSize) => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/phonepe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleSize })
      });
      const data = await res.json();
      if (data.url) {
        // Redirect to PhonePe PG
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Payment Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet & Billing</h1>
        <p className="text-gray-500">Manage your generation credits for ID Cards, Certificates, and Event Passes.</p>
      </div>

      {/* Transaction Result Banner */}
      {txn && txnStatus && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          txnStatus === 'SUCCESS' ? 'bg-green-50 text-green-700 border border-green-200' :
          txnStatus === 'FAILED' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {txnStatus === 'SUCCESS' && <CheckCircle className="w-6 h-6" />}
          {txnStatus === 'FAILED' && <XCircle className="w-6 h-6" />}
          {txnStatus === 'PENDING' && <Loader2 className="w-6 h-6 animate-spin" />}
          <div>
            <h3 className="font-bold">
              {txnStatus === 'SUCCESS' ? 'Payment Successful!' :
               txnStatus === 'FAILED' ? 'Payment Failed' : 'Payment Pending'}
            </h3>
            <p className="text-sm">
              {txnStatus === 'SUCCESS' ? 'Your credits have been added to your wallet.' :
               txnStatus === 'FAILED' ? 'We could not process your transaction. Please try again.' : 'We are waiting for confirmation from your bank.'}
            </p>
          </div>
        </div>
      )}

      {/* Wallet Balance */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg flex items-center justify-between">
        <div>
          <p className="text-blue-100 font-medium mb-1">Available Credits</p>
          <div className="text-5xl font-extrabold flex items-center gap-3">
            {credits !== null ? credits : '...'}
          </div>
          <p className="text-sm text-blue-200 mt-2">1 Credit = 1 Generated PDF Document</p>
        </div>
        <CreditCard className="w-24 h-24 text-white opacity-20" />
      </div>

      {/* Buy Bundles */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Top Up Wallet</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bundle 1 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-800">Starter</h3>
            <div className="text-3xl font-black text-blue-600 my-4">10<span className="text-lg text-gray-500 font-medium"> credits</span></div>
            <p className="text-gray-500 mb-6">₹50</p>
            <button 
              onClick={() => handleBuyCredits(10)}
              disabled={loading}
              className="w-full py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          {/* Bundle 2 */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-md relative transform hover:-translate-y-1 transition-all">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAR</div>
            <h3 className="text-lg font-bold text-blue-900">Professional</h3>
            <div className="text-3xl font-black text-blue-600 my-4">100<span className="text-lg text-blue-400 font-medium"> credits</span></div>
            <p className="text-blue-600/80 mb-6">₹500</p>
            <button 
              onClick={() => handleBuyCredits(100)}
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          {/* Bundle 3 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-800">Enterprise</h3>
            <div className="text-3xl font-black text-blue-600 my-4">500<span className="text-lg text-gray-500 font-medium"> credits</span></div>
            <p className="text-gray-500 mb-6">₹2500</p>
            <button 
              onClick={() => handleBuyCredits(500)}
              disabled={loading}
              className="w-full py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
