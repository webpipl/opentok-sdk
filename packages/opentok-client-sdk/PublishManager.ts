import {
  IOpentokSessionType,
  IOpentokStreamType,
} from "./types/ConnectionEvent";
import SessionManager from "./SessionManager";
import { PUBLISHER_EVENT_NAMES } from "./constants/events-names";
import ISDKCallbacks from "./types/ISdkCallbackTypes";
export type PublisherType = "camera" | "screen";

class PublishManager {
  publisher: {
    camera: OT.Publisher | null;
    screen: OT.Publisher | null;
  } = { camera: null, screen: null };
  initialAudioDevice: OT.Device;
  initialVideoDevice: OT.Device;
  sessionManager: SessionManager | undefined = undefined;
  session: IOpentokSessionType | undefined = undefined;
  callbacks: ISDKCallbacks = {};

  constructor(
    initialAudioDevice: OT.Device,
    initialVideoDevice: OT.Device,
    sessionManager: SessionManager
  ) {
    this.initialAudioDevice = initialAudioDevice;
    this.initialVideoDevice = initialVideoDevice;
    this.sessionManager = sessionManager;
    this.session = sessionManager.session;
  }
  getStreamUniqueId = (stream: OT.Stream) => {
    return `${stream.connection.connectionId}-${stream.videoType}`;
  };

  get isCameraPublished() {
    return this.publisher.camera;
  }
  get isScreenPublished() {
    return this.publisher.screen;
  }
  private isPublished = (publisherType: PublisherType) =>
    this.publisher[publisherType];
  initPublisher = (
    type: PublisherType = "camera",
    element: PublisherType = "camera"
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
  publish = async (type: PublisherType = "camera") => {
    if (this.isPublished(type)) {
      return;
    }
    try {
      await this.initPublisher(type, type);
      const publisherObject = this.publisher[type];
      if (publisherObject) {
        this.sessionManager?.session?.publish(
          publisherObject,
          (error: OT.OTError | undefined) => {
            if (error) {
              console.log(`unable to publish ${type}`, error);
            }
          }
        );

        this.registerEventHandlers(type);
      }
    } catch (error) {
      console.error("error while", error);
    }
  };

  unpublish = (publisherType: PublisherType) => {
    const p = this.publisher[publisherType];
    if (this.publisher && p) {
      this.session?.unpublish(p);
      this.publisher[publisherType] = null;
    }
  };

  private registerEventHandlers(type: PublisherType) {
    this.publisher[type]?.on("streamCreated", this.streamCreated);
    this.publisher[type]?.on("streamDestroyed", this.streamDestroyed);
  }

  /**
   *
   * @description Remove all session event listeners
   */
  private removePublisherEventListener = () => {
    PUBLISHER_EVENT_NAMES.forEach((eventName) => {
      this.publisher.camera?.off(eventName, () => {});
    });
    PUBLISHER_EVENT_NAMES.forEach((eventName) => {
      this.publisher.screen?.off(eventName, () => {});
    });
  };

  private streamCreated = (
    event: OT.Event<"streamCreated", OT.Publisher> & {
      stream: IOpentokStreamType;
    }
  ) => {
    // Handle stream created event
    const { stream } = event;
    stream.me = true;
    this.sessionManager?.addStream(stream);
    // this.onPublishCompletedCallback?.(this.publisher);
    this.callbacks.onPublishCompletedCallback?.(this.publisher);
  };

  private streamDestroyed = (
    event: OT.Event<"streamDestroyed", OT.Publisher> & {
      stream: IOpentokStreamType;
      reason: string;
    }
  ) => {
    // Handle stream destroyed event
    const { stream, reason } = event;
    this.sessionManager?.removeStream(stream);
    this.callbacks.onPublishCompletedCallback?.(this.publisher);
    this.removePublisherEventListener();
  };
  toggleAudioMute = () => {
    const isAudioEnabled = this.publisher.camera?.stream?.hasAudio;
    this.publisher.camera?.publishAudio(!isAudioEnabled);
    this.callbacks.muteCallback?.("audio", isAudioEnabled);
  };
  toggleVideoMute = () => {
    const isVideoEnabled = this.publisher.camera?.stream?.hasVideo;
    this.publisher.camera?.publishVideo(!isVideoEnabled);
    this.callbacks.muteCallback?.("video", isVideoEnabled);
  };
}

export default PublishManager;
