"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/ui/ui/popover";

const Rooms = () => {
  const data = new Map([
    ["1", { data: "jagadhissh" }],
    ["2", { data: "Lakshmi" }],
    ["3", { data: "Chandrika" }],
  ]);
  return (
    <div className=" p-8">
      <Popover>
        <PopoverTrigger className=" relative bg-blue-800 text-white px-4 py-2 rounded-xl">
          Waiting Room{" "}
        </PopoverTrigger>
        <PopoverContent>
          <h3 className=" border-b  text-gray-500 pb-2 mb-2">
            Waiting request
          </h3>
          <div className="">
            <ul>
              {Array.from(data).map(([key, value]) => {
                return (
                  <li
                    className="  justify-between items-center flex flex-row py-1 px-2 rounded-lg cursor-pointer capitalize hover:bg-muted "
                    id={key}
                  >
                    {value.data}

                    <div className="gap-2 flex flex-row justify-between items-center">
                      <button className=" text-xs bg-blue-400 hover:bg-blue-500 text-white px-2.5 py-1 rounded-full">
                        Allow
                      </button>
                      <button className="text-xs bg-slate-100 hover:bg-blue-200 text-black px-2.5 py-1 rounded-full">
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
    </div>
  );
};

export default Rooms;
