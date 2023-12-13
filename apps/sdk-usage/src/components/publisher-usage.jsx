import { useEffect } from "react";
import withPublisher from "./hoc/with-publisher";

const PublisherUsage = ({ opentok }) => {
  useEffect(() => {
    opentok.initPublisher("camera", "camera");
  }, []);

  useEffect(() => {
    opentok.callbacks.publisherElementRemoved = (data) => {
      console.log("publisherElementRemoved created");
    };
    opentok.callbacks.audioLevelUpdate = (data) => {
      console.log("audioLevelUpdate", data);
    };
  }, []);
  const handleDestroy = () => {
    opentok.destroy("camera");
  };
  //
  return (
    <div className="">
      <div id="camera" className="h-[280px] w-[280px]"></div>

      <button
        onClick={handleDestroy}
        className=" px-4 py-2 rounded-xl text-white bg-red-500 "
      >
        Destroy
      </button>
    </div>
  );
};

export default withPublisher(PublisherUsage);
