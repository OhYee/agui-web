import './ConfigPanel.css'

export default function ConfigPanel({ apiUrl, onApiUrlChange, onClear, isRunning }) {
  return (
    <div className="config-panel">
      <div className="config-field">
        <label className="config-label">AG-UI API Endpoint</label>
        <input
          type="text"
          className="config-input"
          value={apiUrl}
          onChange={(e) => onApiUrlChange(e.target.value)}
          placeholder="http://localhost:9000/agui/v1/run"
          disabled={isRunning}
        />
      </div>
      
      <button 
        className="config-clear-btn"
        onClick={onClear}
        disabled={isRunning}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
        Clear All
      </button>
    </div>
  )
}

