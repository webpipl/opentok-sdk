import { useEffect } from "react";

const Sample = ({ opentok, sampleClass }) => {
  useEffect(() => {}, [opentok]);

  const onClick = () => {
    console.log("session:session:", opentok.current.session);
  };
  return (
    <button className="bg-green-800 text-white" onClick={onClick}>
      Saple compoet
    </button>
  );
};
export default Sample;
