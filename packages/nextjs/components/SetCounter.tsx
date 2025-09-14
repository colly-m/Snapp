"use client";
import { useState, type ChangeEvent } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { CONTRACT_NAME } from "~~/utils/Constants";

interface SetCounterProps {
  connectedAddress: string;
  ownerAddress: string;
}

export const SetCounter = ({ connectedAddress, ownerAddress }: SetCounterProps) => {
  const [value, setValue] = useState<string>("");

  const isOwner = (connectedAddress && ownerAddress) ?
    BigInt(connectedAddress) === BigInt(ownerAddress) : false;
    
  const { sendAsync, isPending } = useScaffoldWriteContract({
    contractName: CONTRACT_NAME,
    functionName: "set_counter",
    args: [BigInt(value || "0")],
    // value: 0,
    // enabled: isOwner,
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Allow only numeric input
    if (/^\d*$/.test(inputValue)) {
      setValue(inputValue);
    }
  };

  const disabled = isPending || !isOwner || value === "";

  const onSet = async () => {
    try {
      await sendAsync({ args: [Number(value)] });
      setValue("");
    } catch (e) {
      console.error("Error setting counter:", e);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="input input-bordered w-32"
        placeholder="Enter value"
        value={value}
        onChange={onChange}
        disabled={!isOwner || isPending}
      />
      <button
        className="btn btn-primary"
        onClick={onSet}
        disabled={disabled}
      >
        {isPending ? "Setting..." : "Set Counter"}
      </button>
    </div>
  )
}