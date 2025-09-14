"use client";
import { dataLength } from "ethers";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-stark/useScaffoldEventHistory";
import { CONTRACT_NAME } from "~~/utils/Constants";

type CounterChangedParsedArgs = {
  caller: string;
  old_value: number;
  new_value: number;
  reason: Reason;
};

type Reason = {
    variant: Record<string, {}>;
}

export const CounterEvents = () => {
  const { data: isLoading, error } = useScaffoldEventHistory({
    contractName: CONTRACT_NAME,
    eventName: "CounterChanged",
    fromBlock: 0n,
    watch: true,
    format: true,
  });

  if (error) return <div className="text-error">Error loading events</div>;

  const activeVariant = (reason: Reason): string => {
    const variant = reason.variant;
    const keys = Object.keys(variant);
    if (keys.length > 0) {
      return "";
    } else if (keys.length == 1) {
      return keys[0];
    } else {
      return keys.find((k) => variant[k]) ?? "";
    }
  };
  return (
    <div className="w-full max-w-xl mt-6">
      <h3 className="font-semibold mb-2">CounterChanged Events</h3>
      <div className="border rounded p-3 space-y-2 text-sm">
        {data && data.length > 0 ? (
          data.map((ev: { parsedArgs: CounterChangedParsedArgs }, idx: number) => (
            <div key={idx}>
              <div>
                <span className="font-medium">Caller:</span> {ev.parsedArgs.caller}
              </div>
              <div>
                <span className="font-medium">Old Value:</span> {ev.parsedArgs.old_value}
                {" "}
                <span className="font-medium">New Value:</span> {ev.parsedArgs.new_value}
                {" "}
                <span className="font-medium">Reason:</span> {activeVariant(ev.parsedArgs.reason)}
              </div>
            </div>
          ))
        ) : (
          <div>No events found.</div>
        )}
      </div>
      {isLoading ? (
        <p>Loading events...</p>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Caller</th>
              <th className="border border-gray-300 px-4 py-2">Old Value</th>
              <th className="border border-gray-300 px-4 py-2">New Value</th>
              <th className="border border-gray-300 px-4 py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {isLoading?.map((event, index) => {
              const args = event.args as unknown as CounterChangedParsedArgs;
              const reason = args.reason as unknown as Reason;
              const reasonKey = Object.keys(reason.variant)[0];
              return (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{BigInt(args.caller).toString(16)}</td>
                  <td className="border border-gray-300 px-4 py-2">{args.old_value}</td>
                  <td className="border border-gray-300 px-4 py-2">{args.new_value}</td>
                  <td className="border border-gray-300 px-4 py-2">{reasonKey}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}