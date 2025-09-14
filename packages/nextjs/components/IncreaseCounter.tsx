"use client";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { CONTRACT_NAME } from "~~/utils/Constants";

export const IncreaseCounter = () => {
  const {sendAsync, isPending} = useScaffoldWriteContract({
    contractName: CONTRACT_NAME,
    functionName: "increase_counter",
  });

  const handleIncreaseCounter = async () => {
    try {
      await sendAsync();
    } catch (e) {
      console.error("Error increase counter", e);
    }
  };

  return (
    <button
      onClick={handleIncreaseCounter}
      disabled={isPending}
      className="btn btn-primary">
        Increase Counter
    </button>
  );
}
