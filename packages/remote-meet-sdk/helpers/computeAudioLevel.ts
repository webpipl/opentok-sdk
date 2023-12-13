const calculateAudioLevel = () => {
  let movingAvg: number | null = null;
  const LOG_BASE: number = Math.LN10;
  const SCALE_FACTOR: number = 1.5;
  const SMOOTHING_FACTOR: number = 0.2;
  const MAX_LEVEL: number = 1;
  const MIN_LEVEL: number = 0;

  return (audioLevel: number): number => {
    if (movingAvg === null || movingAvg <= audioLevel) {
      movingAvg = audioLevel;
    } else {
      movingAvg =
        (1 - SMOOTHING_FACTOR) * movingAvg + SMOOTHING_FACTOR * audioLevel;
    }

    const currentLogLevel =
      Math.log(movingAvg) / LOG_BASE / SCALE_FACTOR + MAX_LEVEL;
    const clampedLevel =
      Math.min(Math.max(currentLogLevel, MIN_LEVEL), MAX_LEVEL) * 100;

    return clampedLevel;
  };
};

export default calculateAudioLevel;
