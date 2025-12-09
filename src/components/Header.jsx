import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path 
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="header-title">AG-UI Protocol Demo</h1>
      </div>
      
      <div className="header-links">
        <a 
          href="https://docs.ag-ui.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="header-link"
        >
          Documentation
        </a>
        <a 
          href="https://github.com/OhYee/agui-web" 
          target="_blank" 
          rel="noopener noreferrer"
          className="header-link"
        >
          Repository
        </a>
      </div>
    </header>
  )
}

