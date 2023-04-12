import { useMemo, useRef } from "react";
import config from "../config";
import "./track-pad.css";

export default function TrackPad() {
  const mouseState = useMemo(
    () => ({
      lastPoint: { x: 0, y: 0 },
      currentPoint: { x: 0, y: 0 },
      sendingMouseMovements: false,
      clickInitialized: false,
      rightClickInitialized: false,
      waitingForResponse: false,
    }),
    []
  );

  const trackPadRef = useRef<HTMLDivElement>(null);

  function handleClick() {
    fetch(config.apiEndpoint + "mouse-click");
  }

  function handleRightClick() {
    fetch(config.apiEndpoint + "mouse-right-click");
  }

  function handleMouseMove(e: React.TouchEvent<HTMLDivElement>) {
    mouseState.currentPoint.x = e.touches[0].clientX;
    mouseState.currentPoint.y = e.touches[0].clientY;

    mouseState.clickInitialized = false;
    mouseState.rightClickInitialized = false;
  }

  function handleMouseDown(e: React.TouchEvent<HTMLDivElement>) {
    const eventPoint = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    mouseState.currentPoint = { ...eventPoint };
    mouseState.lastPoint = { ...eventPoint };

    mouseState.sendingMouseMovements = true;
    if (e.touches.length === 1) mouseState.clickInitialized = true;
    else mouseState.rightClickInitialized = true;
  }

  function handleMouseUp() {
    mouseState.sendingMouseMovements = false;
    if (mouseState.clickInitialized) handleClick();
    if (mouseState.rightClickInitialized) handleRightClick();
  }

  function handleMouseLeave() {
    mouseState.sendingMouseMovements = false;
  }

  function sendMouseEventsToServer() {
    if (mouseState.waitingForResponse) return;

    const curr = mouseState.currentPoint;
    const last = mouseState.lastPoint;
    mouseState.lastPoint = { ...mouseState.currentPoint };

    if (!mouseState.sendingMouseMovements) return;
    if (!trackPadRef?.current) return;
    if (curr.x === last.x && curr.y === last.y) return;

    const maxDimension = Math.max(
      trackPadRef.current.clientHeight,
      trackPadRef.current.clientWidth
    );

    const vectorOfMovement = {
      x: curr.x - last.x,
      y: curr.y - last.y,
    };

    vectorOfMovement.x /= maxDimension;
    vectorOfMovement.y /= maxDimension;

    mouseState.waitingForResponse = true;

    fetch(config.apiEndpoint + "mouse-vector", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vectorOfMovement),
    }).finally(() => (mouseState.waitingForResponse = false));
  }

  setInterval(sendMouseEventsToServer, config.refreshPeriod);

  return (
    <div
      ref={trackPadRef}
      onTouchStart={(e) => handleMouseDown(e)}
      onTouchEnd={handleMouseUp}
      onTouchMove={(e) => handleMouseMove(e)}
      onMouseLeave={handleMouseLeave}
      className="track-pad no-select"
    ></div>
  );
}
