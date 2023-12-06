import OT, { Event } from "@opentok/client";
import { ConnectionStatus, SignalPermission } from "./enums/connection-status";
import parseJSON from "./helpers/parseJSON";
import IOpentokActionsListener, {
  IJoinRequestType,
} from "./IOpentokActionsListener";
import {
  IOpentokSessionType,
  IOpentokStreamType,
} from "./types/ConnectionEvent";
import OpentokBase from "./OpentokBase";
type PublisherType = "camera" | "screen";

class OpentokSession extends OpentokBase implements IOpentokActionsListener {
  session: IOpentokSessionType | undefined = undefined;
  status: ConnectionStatus = ConnectionStatus.Idle;
  connections: Map<string | undefined, OT.Connection | undefined | null> =
    new Map<string, OT.Connection>();
  // eventManager: EventEmitter;
  publisher: {
    camera: OT.Publisher | null;
    screen: OT.Publisher | null;
  } = { camera: null, screen: null };
  streams: Map<string, IOpentokStreamType | undefined | null> = new Map<
    string,
    OT.Stream
  >(null);
  subscribers: Map<string, OT.Subscriber> = new Map<string, OT.Subscriber>();
  joinRequests: Map<string, IJoinRequestType> = new Map<
    string,
    IJoinRequestType
  >();

  disconnectTimer: any = null;
  connectionCount: number = 0;
  DISCONNECT_ON_TIME: number = 120000;
  constructor() {
    super();
  }

  intializeSession = (apiKey: string, sessionId: string) => {
    return OT.initSession(apiKey, sessionId);
  };

  onStreamCreate = (key: string, stream: OT.Stream) => {
    // if(this.setAbc&&typeof this.Abc==="function"){
    //   this.setAbc(key,stream)
    // }
  };

  onStreamDestroy = (key: string, stream: OT.Stream) => {};
  onSessionConnectionStatusChange = (data: any) => {};
  onConnection = (connections: any) => {};
  disConnectSessionOnInactive = () => {};
  onMute = (key: string, value: boolean | undefined) => {};
  /**
   *
   * @param {string} apiKey The token used for authentication in the session
   * @param {string} token The token used for authentication in the session
   * @param {string} sessionId  The unique identifier for the session to connect to.
   */
  connectToSession = async (
    apiKey: string,
    sessionId: string,
    token: string
  ): Promise<IOpentokSessionType> => {
    this.session = this.intializeSession(apiKey, sessionId);
    const promise: Promise<IOpentokSessionType> = new Promise(
      (resolve, reject) => {
        this.session?.connect(token, (error?: OT.OTError) => {
          if (error) {
            this.status = ConnectionStatus.Failed;
          }
          this.status = ConnectionStatus.Connected;
          if (this.session?.connection?.data) {
            let parsedData = JSON.parse(
              JSON.parse(this.session?.connection?.data)
            );
            this.session.data = parsedData;
            this.session.connection.data = parsedData;
          }
          resolve(this.session as IOpentokSessionType);
        });
      }
    );

    this.initializeSessionEvents();
    return promise;
  };

  /**
   * @returns Promise boolean
   */
  disconnectFromSession = (): Promise<Boolean> => {
    return new Promise((resolve, reject) => {
      this.session?.disconnect();
      resolve(true);
    });
  };

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

  subscribe = (
    stream: OT.Stream,
    element: HTMLElement,
    properties: OT.SubscriberProperties,
    name: string
  ): Promise<OT.Subscriber | OT.OTError | undefined> => {
    // if (this.subscribers.get(this.getStreamUniqueId(stream))) {
    //   return Promise.resolve(undefined);
    // }
    // console.log(
    //   "subcribleStream:",
    //   this.streams.get(this.getStreamUniqueId(stream))
    // );
    if (!this.streams.get(this.getStreamUniqueId(stream))) {
      return Promise.resolve(undefined);
    }
    // const data = JSON.parse(JSON.parse(stream.connection.data));
    const data = stream.connection.data;
    properties = {
      width: "280px",
      height: "280px",
      insertMode: "append",
      name: data?.name || name,
    };
    // console.log("strea:", data);
    let _self = this;
    return new Promise((resolve, reject) => {
      const subscriber = this.session?.subscribe(
        stream,
        element,
        properties,
        (error?: OT.OTError | undefined) => {
          if (error) {
            console.log("unable to subscribe");
            reject(error);
          }

          if (subscriber) {
            this.subscribers.set(_self.getStreamUniqueId(stream), subscriber);
            resolve(subscriber);
          }
        }
      );
      subscriber?.on("destroyed", () => {
        console.log("subscriber destroyed");
      });
    });
  };
  //
  // publishScreen = async () => {
  //   try {
  //     await this.initPublisher("screen", "screen");
  //     if (this.publisher.screen) {
  //       this.session?.publish(this.publisher.screen, (error) => {});
  //     }
  //     this.registerPublisherScreenEvents();
  //   } catch (error) {}
  // };

  unpublish = (publisherType: PublisherType) => {
    const p = this.publisher[publisherType];
    // console.log("unpublished");
    if (this.publisher && p) {
      this.session?.unpublish(p);
      this.publisher[publisherType] = null;
    }
  };

  onPublisherChanges = (publisher: {
    camera: OT.Publisher | null;
    screen: OT.Publisher | null;
  }) => {};

  raisePublisherChangedEvent = () => {
    this.onPublisherChanges(this.publisher);
    // this.eventManager.emit("PUBLISHER_UPDATED", this.publisher);
  };
  toggleAudioMute = () => {
    const isAudioEnabled = this.publisher.camera?.stream?.hasAudio;
    this.publisher.camera?.publishAudio(!isAudioEnabled);
    this.onMute("audio", isAudioEnabled);
    // this.eventManager.emit("mutedDevices", { audio: isAudioEnabled });
  };
  toggleVideoMute = () => {
    const isVideoEnabled = this.publisher.camera?.stream?.hasVideo;
    this.publisher.camera?.publishVideo(!isVideoEnabled);
    this.onMute("video", isVideoEnabled);

    // this.eventManager.emit("mutedDevices", { video: isVideoEnabled });
  };

  get isCameraPublished() {
    return this.publisher.camera;
  }
  get isScreenPublished() {
    return this.publisher.screen;
  }

  getStreamUniqueId = (stream: OT.Stream) => {
    return `${stream.connection.connectionId}-${stream.videoType}`;
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
  /**
   * @description this function helps to load all session events
   */
  initializeSessionEvents = () => {
    this.listToJoiSignals();

    this.session?.on("sessionConnected", this.sessionConnected.bind(this));
    this.session?.on(
      "sessionDisconnected",
      this.sessionDisconnected.bind(this)
    );
    this.session?.on(
      "sessionReconnecting",
      this.sessionReconnecting.bind(this)
    );
    this.session?.on("connectionCreated", this.connectionCreated.bind(this));
    this.session?.on(
      "connectionDestroyed",
      this.connectionDestroyed.bind(this)
    );
    this.session?.on("sessionReconnected", this.sessionReconnected.bind(this));
    this.session?.on("streamCreated", this.sessionStreamCreated);
    this.session?.on("streamDestroyed", this.sessionStreamDestroyed);
  };

  sessionStreamCreated = (
    event: OT.Event<"streamCreated", OT.Session> & {
      stream: IOpentokStreamType;
    }
  ) => {
    const { stream } = event;
    stream.me = false;
    let parsedData = stream.connection.data;
    stream.connection.data = parsedData;

    this.streams?.set(this.getStreamUniqueId(stream), stream);
    this.onStreamCreate(this.getStreamUniqueId(stream), stream);

    // const subscriber = this.session?.subscribe(stream, "remote-videos", {
    //   width: "180px",
    //   height: "180px",
    //   insertMode: "append",
    //   fitMode: "contain",
    //   name: "Subsciber",
    // });
    // if (subscriber) {
    //   this.subscribers.set(this.getStreamUniqueId(stream), subscriber);
    // }
  };
  sessionStreamDestroyed = (
    event: OT.Event<"streamDestroyed", OT.Session> & {
      stream: IOpentokStreamType;
      reason: string;
    }
  ) => {
    const { stream } = event;

    this.streams?.delete(this.getStreamUniqueId(stream));
    // console.log("streams:after-destroy ", this.streams);
    // this.onStreamUpdate(this.streams);
    // const subscriberKey =
    //   event.stream.connection.connectionId + "-" + stream.videoType;
    // const subscriber = this.subscribers.get(subscriberKey);
    this.onStreamDestroy(this.getStreamUniqueId(stream), stream);

    // if (subscriber) {
    //   this.session?.unsubscribe(subscriber);
    // }
    // this.subscribers.delete(this.getStreamUniqueId(stream));
  };

  sendSessionStatus = () => {
    this.onSessionConnectionStatusChange(this.status);
    // this.eventManager.emit("updateSessionConnectionStatus", this.status);
  };

  sessionConnected(event: Event<"sessionConnected", OT.Session>) {
    this.session = event.target;
    this.status = ConnectionStatus.Connected;
    this.sendSessionStatus();
  }

  sessionDisconnected(event: Event<"sessionDisconnected", OT.Session>) {
    this.status = ConnectionStatus.Disconnected;
    this.session = undefined;
    console.log("session disconnected thank you");
    this.sendSessionStatus();
  }
  sessionReconnecting(event: Event<"sessionReconnecting", OT.Session>) {
    // console.log("onSessionReConnecting:", event);
    this.status = ConnectionStatus.ReConnecting;
    this.sendSessionStatus();
  }
  sessionReconnected(event: Event<"sessionReconnected", OT.Session>) {
    this.status = ConnectionStatus.Connected;
    this.sendSessionStatus();
  }

  isIamHost = () => {
    if (this.session?.connection) {
      // console.log("input:", this.session?.connection.data);
      let data = this.session?.connection.data;
      if (typeof data === "string") {
        data = parseJSON(data);
      }
      return data?.role === "host";
    }
  };

  getHost = (): OT.Connection | null | undefined => {
    const cnnArray = Array.from(this.connections.values());
    // console.log(cnnArray);
    const host = cnnArray.find((connection) => {
      const data =
        typeof connection?.data === "string"
          ? JSON.parse(JSON.parse(connection?.data))
          : connection?.data;
      return data?.role === "host";
    });
    return host;
  };

  onShowParticipantRequestingPanle = (read: boolean) => {};
  connectionCreated(
    event: Event<"connectionCreated", OT.Connection | OT.Session> & {
      connection: OT.Connection;
    }
  ) {
    const { connection } = event;
    let parsedData =
      typeof connection.data === "string"
        ? JSON.parse(JSON.parse(connection.data))
        : connection.data;
    connection.data = parsedData;

    this.connections?.set(connection?.connectionId, connection);
    this.onConnection(this.connections);
    if (connection.connectionId === this.session?.connection?.connectionId) {
      const { connection: sessionConnection } = this.session;
      if (this.isIamHost()) {
      } else {
        console.log("iam participant");
        this.onShowParticipantRequestingPanle(true);
      }
    }

    console.log("connection:", connection);
    this.connectionCount++;
    this.monitorSessionForInactivityToDisconnect();
  }
  connectionDestroyed(
    event: Event<"connectionDestroyed", OT.Connection | OT.Session> & {
      connection: OT.Connection;
    }
  ) {
    const { connection } = event;
    this.connections?.delete(connection?.connectionId);
    this.connectionCount--;
    this.monitorSessionForInactivityToDisconnect();
  }

  //Disconnects the session if connectionCount is <2 for 2 minutes
  monitorSessionForInactivityToDisconnect = () => {
    if (this.connectionCount < 2) {
      if (this.disconnectTimer) clearTimeout(this.disconnectTimer);
      this.disconnectTimer = setTimeout(
        this.disconnectSessionOnByTimeout,
        this.DISCONNECT_ON_TIME
      );
    } else {
      if (this.disconnectTimer) {
        clearTimeout(this.disconnectTimer);
        this.disconnectTimer = null;
      }
    }
  };

  disconnectSessionOnByTimeout = () => {
    this.session?.disconnect();
    this.disConnectSessionOnInactive();
  };
  /**
   *
   * @param type SIGNAL TYPE
   * @param to To which connection u want to send signal
   * @param data data you want to send
   * @param onSent callback
   */
  sendSignal = (
    type: string,
    to: OT.Connection,
    data: any,
    onSent?: (data?: any) => void
  ) => {
    let signal = {
      data,
      ...(type && { type }),
      ...(to && { to }),
    };

    this.session?.signal(signal, (error) => {
      if (error) {
        onSent?.(error.message);
        throw new Error("[ReactUseOpenTok] sendSignal error: " + error.message);
      } else if (typeof onSent === "function") {
        onSent?.();
      }
    });
  };

  onNewJoinRequest = (key: string, data: IJoinRequestType) => {};
  onParticipantReceivesHostResponse = (data: IJoinRequestType) => {};
  listToJoiSignals = () => {
    //Listen for if any participants wish to join the meeting.
    this.session?.on("signal:ASK_TO_JOIN", (event) => {
      const signalType = event as IJoinRequestType;
      const storableData: IJoinRequestType = {
        data: signalType.data,
        status: "IDLE",
        from: signalType.from,
      };
      const key = signalType.from.connectionId;
      this.joinRequests.set(key, storableData);
      this.onNewJoinRequest(key, storableData);
    });

    // Listens for the host's response to the participant
    this.session?.on("signal:REPOND_TO_JOIN_REQUEST", (event) => {
      // const storableData: IJoinRequestType = {
      //   data: event.data,
      //   status: event.data,
      //   from: event.from,
      // };
      this.onParticipantReceivesHostResponse(event as IJoinRequestType);
      console.log("Response from host", event);
    });
  };

  // Host processes and replies to participant's join request
  onRespondToJoinRequest = (
    permission: string,
    data: IJoinRequestType
  ): Promise<IJoinRequestType | undefined> => {
    console.log(permission, data);
    return new Promise((resolve, reject) => {
      this.sendSignal(
        "REPOND_TO_JOIN_REQUEST",
        data.from,
        permission,
        (error?: OT.OTError | undefined) => {
          if (error) {
            resolve(undefined);
            console.log("unable to send request");
            return;
          }
          if (permission === SignalPermission.Granted) {
            this.joinRequests.delete(data.from.connectionId);
          }
          resolve(data);
        }
      );
    });
  };

  // Participant initiates a join request to the host.
  sendRequestToHost = (): Promise<boolean> => {
    const host = this.getHost();
    console.log("sendRequest:", host);
    const hostConnection = this.session?.connections.get(
      host?.connectionId
    ) as OT.Connection;
    if (hostConnection) {
      return new Promise((resolve, reject) => {
        this.sendSignal(
          "ASK_TO_JOIN",
          hostConnection,
          "Jagadhissh",
          (error?: OT.OTError | undefined) => {
            if (error) {
              reject(false);
              console.log("unable to send request");
              return;
            }
            resolve(true);
            console.log("request sent");
          }
        );
      });
    }
    return Promise.reject(false);

    console.log("session:", hostConnection);
  };
}

export default OpentokSession;
