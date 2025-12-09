import './EventTag.css'

const EVENT_STYLES = {
  // Lifecycle
  RUN_STARTED: { color: 'green', icon: '▶' },
  RUN_FINISHED: { color: 'green', icon: '✓' },
  RUN_ERROR: { color: 'red', icon: '✕' },
  STEP_STARTED: { color: 'orange', icon: '→' },
  STEP_FINISHED: { color: 'orange', icon: '✓' },
  
  // Text messages
  TEXT_MESSAGE_START: { color: 'cyan', icon: '💬' },
  TEXT_MESSAGE_CONTENT: { color: 'cyan', icon: '…' },
  TEXT_MESSAGE_END: { color: 'cyan', icon: '✓' },
  
  // Tool calls
  TOOL_CALL_START: { color: 'purple', icon: '🔧' },
  TOOL_CALL_ARGS: { color: 'purple', icon: '{ }' },
  TOOL_CALL_END: { color: 'purple', icon: '✓' },
  TOOL_CALL_RESULT: { color: 'purple', icon: '←' },
  
  // State
  STATE_SNAPSHOT: { color: 'blue', icon: '📸' },
  STATE_DELTA: { color: 'blue', icon: 'Δ' },
  
  // Messages
  MESSAGES_SNAPSHOT: { color: 'blue', icon: '📋' },
  
  // Special
  RAW: { color: 'gray', icon: '{ }' },
  CUSTOM: { color: 'pink', icon: '✦' },
}

export default function EventTag({ type, className = '' }) {
  const style = EVENT_STYLES[type] || { color: 'gray', icon: '?' }
  
  return (
    <span className={`event-tag event-tag--${style.color} ${className}`}>
      <span className="event-tag-icon">{style.icon}</span>
      <span className="event-tag-text">{type}</span>
    </span>
  )
}

