import { IDevicePermissionStatusType } from "./IOpentokActionsListener";
import {
  MediaPermissionsError,
  requestMediaPermissions,
  MediaPermissionsErrorType,
} from "mic-check";
import {
  IOpentokSessionType,
  IOpentokStreamType,
} from "./types/ConnectionEvent";
type PublisherType = "camera" | "screen";

class OpentokPublisher {
  publisher: {
    camera: OT.Publisher | null;
    screen: OT.Publisher | null;
  };
  audioDevices: OT.Device[];
  videoDevices: OT.Device[];
  devicePermissions: IDevicePermissionStatusType;
  devicePermissionError: MediaPermissionsError;
  session: IOpentokSessionType | null | undefined;
  streams: Map<string, IOpentokStreamType | undefined | null>;
  constructor(
    session: IOpentokSessionType | undefined,
    streams: Map<string, IOpentokStreamType | undefined | null>
  ) {
    this.publisher = {
      camera: null,
      screen: null,
    };
    this.session = session;
    this.streams = streams;
    this.devicePermissions = { mic: false, video: false };
    this.checkPermissions();
    this.devicePermissionError = {
      name: "",
      type: undefined,
      message: "",
    };
    this.audioDevices = [];
    this.videoDevices = [];
  }
  public get initialAudioDevice() {
    return this.audioDevices[0];
  }
  public get initialVideoDevice() {
    return this.audioDevices[0];
  }


  initPublisher = (
    type: "camera" | "screen" = "camera",
    element: "camera" | "screen" = "camera"
  ): Promise<OT.Publisher | null> => {
    let properties: any = {
      name: "Publisher",
      style: { nameDisplayMode: "on" },
      width: "280px",
      height: "280px",
      publishAudio: false,
      publishVideo: false,
    };

    if (type === "screen") {
      properties["videoSource"] = "screen";
      properties["insertMode"] = "append";
    }

    if (type === "camera") {
      if (this.initialAudioDevice)
        properties["audioSource"] = this.initialAudioDevice.deviceId;
      //   ...properties,
      //   ...(this.initialAudioDevice && {
      //     audioSource: this.initialAudioDevice.deviceId,
      //   }),
      //   ...(this.initialVideoDevice && {
      //     videoSource: this.initialVideoDevice.deviceId,
      //   }),
      // };
    }

    return new Promise((resolve, reject) => {
      this.publisher[type] = OT.initPublisher(
        element,
        properties,
        (error: OT.OTError | undefined): void => {
          if (error) reject(this.publisher[type]);
          resolve(this.publisher[type]);
        }
      );
    });
  };
  isPublished = (publisherType: PublisherType) => this.publisher[publisherType];
  publish = async (type: PublisherType = "camera") => {
    if (this.isPublished(type)) {
      return;
    }
    try {
      await this.initPublisher(type, type);
      const publisherObject = this.publisher[type];
      if (publisherObject) {
        this.session?.publish(
          publisherObject,
          (error: OT.OTError | undefined) => {
            if (error) {
              console.log(`unable to publish ${type}`, error);
            }
          }
        );
        type === "camera"
          ? this.initialiPublisherEvents()
          : this.registerPublisherScreenEvents();
      }
    } catch (error) {
      console.error("error while", error);
    }
  };

  initialiPublisherEvents = (type: "camera" | "screen" = "camera") => {
    this.publisher[type]?.on("accessAllowed", this.onPublisherAccessAllowed);
    this.publisher[type]?.on("streamCreated", this.onPublisherStreamCreated);
    this.publisher[type]?.on(
      "streamDestroyed",
      this.onPublisherStreamDestroyed
    );
    this.publisher[type]?.on(
      "videoElementCreated",
      this.onPublisherVideoElementCreated
    );
  };
  registerPublisherScreenEvents = (type: "screen" | "camera" = "screen") => {
    this.publisher[type]?.on("streamCreated", this.onPublisherStreamCreated);
    this.publisher[type]?.on(
      "streamDestroyed",
      this.onPublisherStreamDestroyed
    );
  };

  onPublisherAccessAllowed = (
    event: OT.Event<"accessAllowed", OT.Publisher>
  ) => {};
  onPublisherStreamCreated = (
    event: OT.Event<"streamCreated", OT.Publisher> & {
      stream: IOpentokStreamType;
    }
  ) => {
    const { stream } = event;
    stream.me = true;
    let parsedData = stream.connection.data;
    stream.connection.data = parsedData;

    this.streams?.set(this.getStreamUniqueId(stream), event.stream);
    // this.eventManager.emit("STREAM_UPDATED", this.streams);
    // this.onStreamUpdate(this.streams);
    // console.log(
    //   "[PUBLISHER-STREAM-CREATED]",
    //   `${stream.connection.connectionId}-${stream.videoType}`,
    //   stream
    // );
    this.onStreamCreate(this.getStreamUniqueId(stream), stream);

    this.raisePublisherChangedEvent();
  };
  onPublisherStopsSharing = (
    event: OT.Event<"mediaStopped", OT.Publisher>
  ) => {};
  onPublisherStreamDestroyed = (
    event: OT.Event<"streamDestroyed", OT.Publisher> & {
      stream: IOpentokStreamType;
      reason: string;
    }
  ) => {
    const { stream, reason } = event;
    this.streams?.delete(this.getStreamUniqueId(stream));
    this.raisePublisherChangedEvent();
    this.onStreamDestroy(this.getStreamUniqueId(stream), stream);
  };
  onPublisherVideoElementCreated = (
    event: OT.Event<"videoElementCreated", OT.Publisher> & {
      element: HTMLVideoElement | HTMLObjectElement;
    }
  ) => {};
  onStreamCreate = (key: string, stream: OT.Stream) => {};
  onStreamDestroy = (key: string, stream: OT.Stream) => {};

  getStreamUniqueId = (stream: OT.Stream) => {
    return `${stream.connection.connectionId}-${stream.videoType}`;
  };
  raisePublisherChangedEvent = () => {
    this.onPublisherChanges(this.publisher);
  };
  onPublisherChanges = (publisher: {
    camera: OT.Publisher | null;
    screen: OT.Publisher | null;
  }) => {};

  onDevicePermissionCheck = (
    error?: MediaPermissionsError | undefined,
    status?: IDevicePermissionStatusType
  ) => {};

  //check media permissions
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
            // setShowDialog(DialogType.systemDenied);
            console.log("Permission:SystemPermissionDenied", error);
            this.devicePermissionError = error;
            break;
          case MediaPermissionsErrorType.UserPermissionDenied:
            console.log("Permission:UserPermissionDenied", error);
            this.devicePermissionError = error;
            // browser doesn't have access to devices
            // setShowDialog(DialogType.userDenied);
            break;
          case MediaPermissionsErrorType.CouldNotStartVideoSource:
            console.log("Permission:CouldNotStartVideoSource", error);
            this.devicePermissionError = error;
            // most likely when other apps or tabs are using the cam/mic (mostly windows)
            // setShowDialog(DialogType.trackError);
            break;

          default:
            console.log("Permission:default", error);

            break;
        }

        this.onDevicePermissionCheck(error);
        // setErrorDetails(error);
      });

    // setTimeout(() => {
    //   checkForExplanationDialog();
    // }, 500);
  };
}

export default OpentokPublisher;
