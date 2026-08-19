export const OPENCLAW_HEARTBEAT_POLL_SENTINEL = '[insightAll heartbeat poll]';
export const OPENCLAW_HEARTBEAT_ACK_SENTINEL = 'HEARTBEAT_OK';

export function containsinsightAllHeartbeatPollSentinel(value: string | null | undefined): boolean {
  return (value ?? '').includes(OPENCLAW_HEARTBEAT_POLL_SENTINEL);
}

export function isinsightAllHeartbeatPollText(value: string | null | undefined): boolean {
  return (value ?? '').trim() === OPENCLAW_HEARTBEAT_POLL_SENTINEL;
}

export function isinsightAllHeartbeatAckText(value: string | null | undefined): boolean {
  return (value ?? '').trim().toUpperCase() === OPENCLAW_HEARTBEAT_ACK_SENTINEL;
}
