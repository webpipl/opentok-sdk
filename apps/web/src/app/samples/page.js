import { Popover, PopoverContent, PopoverTrigger } from "@/ui/ui/popover";

const Rooms = () => {
  return (
    <div className=" p-8">
      <Popover>
        <PopoverTrigger className=" relative bg-blue-800 text-white px-4 py-2 rounded-xl">
          Waiting Room{" "}
        </PopoverTrigger>
        <PopoverContent>Place content for the popover here.</PopoverContent>
      </Popover>
    </div>
  );
};

export default Rooms;
