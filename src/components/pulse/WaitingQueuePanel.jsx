import { LiveQueueList } from "../dashboard/primitives/LiveQueueList";

export function WaitingQueuePanel({ queue = [] }) {
  return <LiveQueueList queue={queue} />;
}
