"use client";
import { useScaffoldMultiWriteContract, createContractCall } from "~~/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark";
import useScaffoldStrkBalance from "~~/hooks/scaffold-stark/useScaffoldStrkBalance";
import { CONTRACT_NAME } from "~~/utils/Constants";
import { uint256 } from "starknet";

const DECIMALS = 18n;
const PAYMENT_TOKENS = 1n;
const PAYMENT_AMOUNT = uint256.bnToUint256(PAYMENT_TOKENS * 10n ** DECIMALS);

interface ResetCounterProps {
  counter: number;
  connectedAddress: string;
  ownerAddress: string;
}

export const ResetCounter = ({ counter, connectedAddress, ownerAddress }: ResetCounterProps) => {
  const { data: counterContract } = useDeployedContractInfo(CONTRACT_NAME);
  const counterAddress = counterContract?.address;

  const { value: strkBalance } = useScaffoldStrkBalance({ address: connectedAddress });

  const isOwner = (connectedAddress && ownerAddress) ?
    BigInt(connectedAddress) === BigInt(ownerAddress) : false;

  const isZero = counter == 0;
  const hasEnoughStrk = (strkBalance ?? 0n) >= PAYMENT_TOKENS * 10n ** DECIMALS;

  const resetCall = {
    contractName: CONTRACT_NAME,
    functionName: "reset_counter",
    args: [],
    // value: 0,
  };

  let calls: any[] = [];
  if (!isOwner) {
    calls = [resetCall];
  } else if (counterAddress) {
    calls = [
        createContractCall("Strk", "approve", [counterAddress, PAYMENT_AMOUNT]),
        resetCall,
    ];
  }

  const { sendAsync, isPending } = useScaffoldMultiWriteContract({ calls });

  const handleResetCounter = async () => {
    try {
      await sendAsync?.();
    } catch (e) {
      console.error("Error resetting counter:", e);
    }
  };

  return (
    <button
      className="btn btn-primary"
      onClick={handleResetCounter}
      disabled={isPending || isZero || (!isOwner && !hasEnoughStrk)}
      title={!isOwner ? `Resetting the counter costs ${PAYMENT_TOKENS.toString()} STRK.` : undefined}
    >
        Reset Counter
    </button>
  );
};