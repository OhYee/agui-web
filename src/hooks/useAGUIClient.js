import { useCallback, useRef } from 'react'


function randomUUID() {
  const hexDigits = '0123456789abcdef';
  let uuid = '';

  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-';
    } else if (i === 14) {
      uuid += '4';
    } else if (i === 19) {
      uuid += hexDigits[Math.floor(Math.random() * 4) + 8];
    } else {
      uuid += hexDigits[Math.floor(Math.random() * 16)];
    }
  }
  return uuid;
}


export function useAGUIClient(apiUrl, onEvent) {
  const abortControllerRef = useRef(null)
  
  const sendMessage = useCallback(async (messages, options = {}) => {
    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          messages,
          threadId: options.threadId || randomUUID(),
          runId: options.runId || randomUUID(),
          ...options.extra
        }),
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        
        // Parse SSE events
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]') {
              continue
            }
            
            try {
              const event = JSON.parse(data)
              onEvent(event)
            } catch (e) {
              console.warn('Failed to parse event:', data, e)
            }
          }
        }
      }
      
      // Process remaining buffer
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6).trim()
        if (data && data !== '[DONE]') {
          try {
            const event = JSON.parse(data)
            onEvent(event)
          } catch (e) {
            console.warn('Failed to parse final event:', data, e)
          }
        }
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted')
        return
      }
      
      onEvent({
        type: 'RUN_ERROR',
        message: error.message,
        code: 'CLIENT_ERROR',
        timestamp: Date.now()
      })
    }
  }, [apiUrl, onEvent])
  
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])
  
  return { sendMessage, abort }
}

