import { IOpentokStreamType } from "./types/ConnectionEvent";
import SessionManager from "./SessionManager";
import { PUBLISHER_EVENT_NAMES } from "./constants/events-names";
import ISDKCallbacks from "./types/ISdkCallbackTypes";
import calculateAudioLevel from "./helpers/computeAudioLevel";
export type PublisherType = "camera" | "screen";

class PublishManager {
  publisher: {
    camera: OT.Publisher | null;
    screen: OT.Publisher | null;
  } = { camera: null, screen: null };
  initialAudioDevice: OT.Device;
  initialVideoDevice: OT.Device;
  sessionManager: SessionManager | undefined = undefined;
  callbacks: ISDKCallbacks = {};

  audioLevelCalculator = calculateAudioLevel();

  constructor(
    initialAudioDevice: OT.Device,
    initialVideoDevice: OT.Device,
    sessionManager?: SessionManager
  ) {
    this.initialAudioDevice = initialAudioDevice;
    this.initialVideoDevice = initialVideoDevice;
    this.sessionManager = sessionManager;
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
    elementId: PublisherType = "camera"
  ): Promise<OT.Publisher | OT.OTError> => {
    const properties: OT.PublisherProperties = {
      name: "Publisher",
      style: { nameDisplayMode: "on" },
      width: "100%",
      height: "100%",
      publishAudio: type === "camera", // Assuming default audio publishing for camera
      publishVideo: true, // Assuming always publishing video
      videoSource: type === "screen" ? "screen" : undefined, // If screen, set videoSource to 'screen'
      insertMode: type === "screen" ? "append" : "append", // If screen, set insertMode to 'append'
      audioSource:
        type === "camera" && this.initialAudioDevice
          ? this.initialAudioDevice.deviceId
          : undefined,
    };

    console.log("publisher called:", type);
    return new Promise((resolve, reject) => {
      this.publisher[type] = OT.initPublisher(
        elementId,
        properties,
        (error: OT.OTError | undefined): void => {
          if (error) {
            reject(error);
          }
          // Check if publisher is initialized successfully
          const publisher = this.publisher[type];
          if (publisher) {
            resolve(publisher); // Resolve the promise with the publisher
          }
          this.registerPublisherObjectEventsHandlers(type);
        }
      );
    });
  };

  publish = async (type: PublisherType = "camera") => {
    if (this.isPublished(type)) {
      console.error(`Publisher for ${type} is already published.`);
      return;
    }
    try {
      await this.initPublisher(type, type);
      const publisherObject = this.publisher[type];
      if (!publisherObject) {
        throw new Error(`Failed to initialize publisher for ${type}.`);
      }
      await this.publishStream(publisherObject);
      this.registerEventHandlers(type); // Assuming this method exists and handles event registration
    } catch (error) {
      console.error(`Error while publishing ${type}:`, error);
    }
  };
  private publishStream = async (
    publisher: OT.Publisher
  ): Promise<OT.Publisher> => {
    return new Promise((resolve, reject) => {
      this.sessionManager?.session?.publish(
        publisher,
        (error: OT.OTError | undefined) => {
          if (error) {
            publisher.destroy();
            return reject(error);
          }
          return resolve(publisher);
        }
      );
    });
  };
  unpublish = (publisherType: PublisherType) => {
    const p = this.publisher[publisherType];
    if (this.publisher && p) {
      this.sessionManager?.session?.unpublish(p);
      this.publisher[publisherType] = null;
    }
  };

  destroy = (type: PublisherType) => {
    this.publisher[type]?.destroy();
    this.publisher[type]?.off("destroyed", this.elementRemoved);

    this.publisher[type] = null;
  };

  private registerPublisherObjectEventsHandlers = (type: PublisherType) => {
    this.publisher[type]?.on("destroyed", this.elementRemoved);
  };
  private registerEventHandlers(type: PublisherType) {
    this.publisher[type]?.on("streamCreated", this.streamCreated);
    this.publisher[type]?.on("streamDestroyed", this.streamDestroyed);
    if (type === "camera") {
      this.publisher.camera?.on("audioLevelUpdated", this.audioLevelUpdated);
    }
  }

  private elementRemoved = (event: OT.Event<"destroyed", OT.Publisher>) => {
    this.callbacks.publisherElementRemoved?.(event);
  };

  private audioLevelUpdated = (
    event: OT.Event<"audioLevelUpdated", OT.Publisher> & { audioLevel: number }
  ) => {
    const audioLevel = this.audioLevelCalculator(event.audioLevel);
    this.callbacks.audioLevelUpdate?.(audioLevel);
    // console.log("audio level updated", `${audioLevel}%`);
  };
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
