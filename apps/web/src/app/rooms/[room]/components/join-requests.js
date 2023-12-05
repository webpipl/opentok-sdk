import React from "react";
import useOpentokSDK from "../../provider/use-opentok-sdk";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/ui/popover";

const JoinRequests = () => {
  const { requests, onRespondToJoinRequest } = useOpentokSDK();
  return (
    <Popover>
      <PopoverTrigger className=" relative bg-blue-800 text-white px-4 py-2 rounded-xl">
        Waiting Room{" "}
        <span className=" absolute -top-2 text-center right-0 w-[22px] h-[22px] rounded-2xl bg-green-600 text-white">
          {" "}
          {requests.size}
        </span>
      </PopoverTrigger>
      <PopoverContent>
        <h3 className=" border-b  text-gray-500 pb-2 mb-2">Waiting request</h3>
        <div className="">
          <ul>
            {Array.from(requests).map(([indexKey, value]) => {
              return (
                // <li key={indexKey}>{value.data}</li>
                <li
                  key={indexKey}
                  className="  justify-between items-center flex flex-row py-1 px-2 rounded-lg cursor-pointer capitalize hover:bg-muted "
                >
                  {value?.data}
                  <div className="gap-2 flex flex-row justify-between items-center">
                    <button
                      onClick={() => onRespondToJoinRequest("Granted", value)}
                      className=" text-xs bg-blue-400 hover:bg-blue-500 text-white px-2.5 py-1 rounded-full"
                    >
                      Allow
                    </button>
                    <button
                      onClick={() => onRespondToJoinRequest("Denied", value)}
                      className="text-xs bg-slate-100 hover:bg-blue-200 text-black px-2.5 py-1 rounded-full"
                    >
                      Deny
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
};
export default JoinRequests;
