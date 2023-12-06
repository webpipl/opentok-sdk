import OT from "@opentok/client";
import { IDevicePermissionStatusType } from "./IOpentokActionsListener";
import {
  MediaPermissionsError,
  MediaPermissionsErrorType,
  requestMediaPermissions,
} from "mic-check";

interface IOpentokBaseInterface {
  onDevicePermissionCheck: (
    error?: MediaPermissionsError,
    status?: IDevicePermissionStatusType
  ) => void;
}

class OpentokBase implements IOpentokBaseInterface {
  audioDevices: OT.Device[];
  videoDevices: OT.Device[];
  devicePermissions: IDevicePermissionStatusType;
  devicePermissionError: MediaPermissionsError;

  constructor() {
    this.getAvailableDevices();
    this.audioDevices = [];
    this.videoDevices = [];
    this.devicePermissions = { mic: false, video: false };
    this.checkPermissions();
    this.devicePermissionError = {
      name: "",
      type: undefined,
      message: "",
    };
  }
  public get initialAudioDevice() {
    return this.audioDevices[0];
  }
  public get initialVideoDevice() {
    return this.audioDevices[0];
  }
  onDevicePermissionCheck = (
    error?: MediaPermissionsError | undefined,
    status?: IDevicePermissionStatusType
  ) => {};
  getDevicesWithPromise = (): Promise<{
    audio: OT.Device[];
    video: OT.Device[];
  }> => {
    return new Promise((resolve, reject) => {
      OT.getDevices((error: OT.OTError | undefined, devices?: OT.Device[]) => {
        if (error) {
          reject(error);
          return error;
        }
        if (devices) {
          const audioDevices = devices?.filter(
            (device: OT.Device) => device.kind == "audioInput"
          );

          const videoDevices = devices?.filter(
            (device: OT.Device) => device.kind == "audioInput"
          );
          resolve({ audio: audioDevices, video: videoDevices });
        }
      });
    });
  };

  getAvailableDevices = () => {
    this.getDevicesWithPromise().then(({ audio, video }) => {
      this.audioDevices = audio;
      this.videoDevices = video;
      // console.log({ audio, video });
    });
  };

  checkPermissions = () => {
    requestMediaPermissions()
      .then(() => {
        this.devicePermissions = {
          mic: true,
          video: true,
        };
        this.onDevicePermissionCheck(undefined, this.devicePermissions);
      })
      .catch((error: MediaPermissionsError) => {
        switch (error.type) {
          case MediaPermissionsErrorType.SystemPermissionDenied:
            // user denied permission
            console.log("Permission:SystemPermissionDenied", error);
            this.devicePermissionError = error;
            break;
          case MediaPermissionsErrorType.UserPermissionDenied:
            console.log("Permission:UserPermissionDenied", error);
            this.devicePermissionError = error;
            // browser doesn't have access to devices
            break;
          case MediaPermissionsErrorType.CouldNotStartVideoSource:
            console.log("Permission:CouldNotStartVideoSource", error);
            this.devicePermissionError = error;
            // most likely when other apps or tabs are using the cam/mic (mostly windows)
            break;
          default:
            console.log("Permission:default", error);
            break;
        }
        this.onDevicePermissionCheck(error);
      });
  };
}
export default OpentokBase;
