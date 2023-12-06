"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/ui/ui/popover";
import Link from "next/link";

const Page = () => {
  return (
    <div className=" w-full bg-slate-50 h-screen flex justify-center items-center">
      <section className=" p-4 bg-white w-6/12 h-2/6">
        <div className=" flex flex-row gap-3">
          <Link
            className=" bg-blue-500 hover:bg-opacity-80 rounded-full px-4 py-2   text-white "
            href="/rooms/1"
            target="_blank"
          >
            Join as HOST
          </Link>
          <Link
            className="  bg-green-500 hover:bg-opacity-80 rounded-full px-4 py-2   text-white "
            href="/rooms/2"
            target="_blank"
          >
            Join as Participant
          </Link>
          <Link
            className="  bg-slate-800 hover:bg-opacity-80 rounded-full px-4 py-2   text-white "
            href="/proctor"
            target="_blank"
          >
            Monitor Session
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Page;
