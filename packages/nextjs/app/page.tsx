import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { IncreaseCounter } from "~~/components/IncreaseCounter";
import { DecreaseCounter } from "~~/components/DecreaseCounter";
import { ResetCounter } from "~~/components/ResetCounter";
import { SetCounter } from "~~/components/SetCounter";
import { useAccount } from "~~/hooks/useAccount";
import { CONTRACT_NAME } from "~~/utils/Constants";
import { CounterEvents } from "~~/components/CounterEvents";
import { ConnectedAddress } from "~~/components/ConnectedAddress";

const Home = () => {
  const { data: counterData } = useScaffoldReadContract({
    contractName: CONTRACT_NAME,
    functionName: "get_counter",
    // args: [],
    // watch: true,
  });
  const counter = counterData ? Number(counterData) : 0;

  const { data: ownerAddress } = useScaffoldReadContract({
    contractName: CONTRACT_NAME,
    functionName: "owner",
    // args: [],
    // watch: true,
  });
  const ownerAddressStr = (ownerAddress) ? ownerAddress.toString() : "";

  const { address: connectedAddress } = useAccount();
  const connectedAddressStr = connectedAddress ?? "";

  return (
    <div className="flex items-center flex-col grow pt-10">
      <p>Counter: {counter}</p>
      <div className="flex gap-4 item-center">
        <IncreaseCounter />
        <DecreaseCounter counter={counter} />
        <ResetCounter counter={counter} connectedAddress={connectedAddressStr} ownerAddress={ownerAddressStr} />
      </div>
      <div className="mt-4">
        <SetCounter connectedAddress={connectedAddressStr} ownerAddress={ownerAddress} />
      </div>
      <CounterEvents />
    </div>
  );
};

export default Home;
