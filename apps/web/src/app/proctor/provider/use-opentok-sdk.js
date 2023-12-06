import { useContext } from "react";
import OpentokSDKContext from "./opentok-sdk-context";

const useOpentokSDK = () => useContext(OpentokSDKContext);
export default useOpentokSDK;
