import { useState } from 'react'
import './StatePanel.css'

export default function StatePanel({ state }) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const isEmpty = Object.keys(state).length === 0
  const stateJson = JSON.stringify(state, null, 2)
  
  return (
    <div className="state-panel">
      <button 
        className="state-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="state-header-left">
          <svg 
            className="state-icon" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <h3 className="state-title">State</h3>
          {!isEmpty && (
            <span className="state-badge">
              {Object.keys(state).length} keys
            </span>
          )}
        </div>
        <svg 
          className={`state-chevron ${isExpanded ? 'state-chevron--expanded' : ''}`}
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="state-body">
          {isEmpty ? (
            <div className="state-empty">
              No state data. State will appear here when the agent emits STATE_SNAPSHOT or STATE_DELTA events.
            </div>
          ) : (
            <pre className="state-json">{stateJson}</pre>
          )}
        </div>
      )}
    </div>
  )
}

