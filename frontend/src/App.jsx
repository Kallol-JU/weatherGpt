import { useMemo, useState } from 'react'
import './App.css'

const quickPrompts = [
  { icon: '🌧️', text: 'Will it rain today?' },
  { icon: '🌡️', text: "What's the weather like?" },
  { icon: '🚨', text: 'Are there any warnings?' },
  { icon: '🌾', text: 'Is today good for farming?' },
]

const forecast = [
  { day: 'Today', date: '26 Aug', icon: '⛅', high: 31, low: 25, rain: 20 },
  { day: 'Tomorrow', date: '27 Aug', icon: '🌧️', high: 29, low: 24, rain: 70 },
  { day: 'Friday', date: '28 Aug', icon: '🌦️', high: 30, low: 24, rain: 55 },
  { day: 'Saturday', date: '29 Aug', icon: '☀️', high: 32, low: 25, rain: 15 },
  { day: 'Sunday', date: '30 Aug', icon: '☀️', high: 33, low: 26, rain: 10 },
  { day: 'Monday', date: '31 Aug', icon: '⛅', high: 31, low: 25, rain: 25 },
  { day: 'Tuesday', date: '1 Sep', icon: '🌧️', high: 29, low: 24, rain: 65 },
]

const hourly = [
  ['2 PM', '🌦️', 29], ['3 PM', '🌧️', 28], ['4 PM', '🌧️', 27],
  ['5 PM', '🌧️', 27], ['6 PM', '☁️', 26], ['7 PM', '☁️', 25],
]

const history = [
  ['Will it rain tomorrow?', 'Today · 10:30 AM'],
  ["What's the weather like today?", 'Today · 9:15 AM'],
  ['Any weather warnings?', 'Today · 8:45 AM'],
  ['Is today good for farming?', 'Yesterday · 6:20 PM'],
]

function Icon({ children }) {
  return <span className="ui-icon" aria-hidden="true">{children}</span>
}

function App() {
  const [active, setActive] = useState('chat')
  const [location, setLocation] = useState('Kolkata, India')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [language, setLanguage] = useState('EN')
  const [dark, setDark] = useState(false)
  const [showLocation, setShowLocation] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning!'
    if (hour < 18) return 'Good afternoon!'
    return 'Good evening!'
  }, [])

  const sendMessage = (text = input) => {
    const clean = text.trim()
    if (!clean) return
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: clean },
      {
        role: 'assistant',
        text: makeResponse(clean),
        card: getCardType(clean),
      },
    ])
    setInput('')
    setActive('chat')
  }

  const makeResponse = (text) => {
    const value = text.toLowerCase()
    if (value.includes('farm') || value.includes('crop') || value.includes('spray')) {
      return 'Conditions look fairly suitable for outdoor farm work today. Keep an eye on the rain window and wind before spraying or harvesting.'
    }
    if (value.includes('warning') || value.includes('alert') || value.includes('cyclone') || value.includes('flood')) {
      return 'There are no critical warnings shown for your selected location in this demo. Always follow official local alerts for safety-critical decisions.'
    }
    if (value.includes('rain') || value.includes('umbrella')) {
      return 'Rain is possible today, with a higher chance later in the afternoon. Carrying an umbrella would be a sensible choice.'
    }
    if (value.includes('hot') || value.includes('temperature')) {
      return 'It is around 29°C right now and feels warm. The temperature may stay in the high 20s this afternoon.'
    }
    if (value.includes('tomorrow')) {
      return 'Tomorrow looks cooler with a higher chance of rain, especially during the afternoon.'
    }
    return `For ${location}, it is currently 29°C with partly cloudy skies. Ask me about rain, forecasts, warnings, farming, or climate trends.`
  }

  const getCardType = (text) => {
    const value = text.toLowerCase()
    if (value.includes('farm') || value.includes('crop') || value.includes('spray')) return 'advisory'
    if (value.includes('warning') || value.includes('alert') || value.includes('cyclone') || value.includes('flood')) return 'alert'
    if (value.includes('climate') || value.includes('trend') || value.includes('years') || value.includes('history')) return 'climate'
    if (value.includes('rain') || value.includes('forecast') || value.includes('tomorrow')) return 'weather'
    return 'weather'
  }

  const startNewChat = () => {
    setMessages([])
    setActive('chat')
  }

  return (
    <div className={dark ? 'app-shell dark' : 'app-shell'}>
      <aside className="sidebar">
        <div className="brand-row">
          <button className="brand" onClick={startNewChat} aria-label="New chat">
            <span className="brand-mark">☁</span>
            <span>WeatherGPT</span>
          </button>
          <button className="icon-btn mobile-only" onClick={() => setActive('chat')} aria-label="Close menu">×</button>
        </div>

        <button className="new-chat" onClick={startNewChat}><span>＋</span> New chat</button>

        <nav className="nav-list" aria-label="WeatherGPT sections">
          <NavItem active={active === 'chat'} icon="💬" label="Chat" onClick={() => setActive('chat')} />
          <NavItem active={active === 'forecast'} icon="🌤️" label="Forecast" onClick={() => setActive('forecast')} />
          <NavItem active={active === 'alerts'} icon="🚨" label="Alerts" badge="2" onClick={() => setActive('alerts')} />
          <NavItem active={active === 'advisory'} icon="🌾" label="Advisories" onClick={() => setActive('advisory')} />
          <NavItem active={active === 'climate'} icon="📈" label="Climate" onClick={() => setActive('climate')} />
          <NavItem active={active === 'voice'} icon="🎙️" label="Voice" onClick={() => setActive('voice')} />
          <NavItem active={active === 'history'} icon="🕘" label="History" onClick={() => setActive('history')} />
        </nav>

        <div className="sidebar-spacer" />

        <button className="location-mini" onClick={() => setShowLocation(true)}>
          <span className="pin">⌖</span>
          <span><strong>{location}</strong><small>Change location</small></span>
          <span>›</span>
        </button>
        <button className="profile-row" onClick={() => setShowProfile(true)}>
          <span className="avatar">M</span>
          <span><strong>My WeatherGPT</strong><small>Settings & preferences</small></span>
          <span>›</span>
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setActive('chat')} aria-label="Menu">☰</button>
          <div className="top-location" onClick={() => setShowLocation(true)}>
            <span className="green-dot" />
            <span><strong>{location}</strong><small>Live weather</small></span>
            <span>⌄</span>
          </div>
          <div className="top-actions">
            <button className="language-btn" onClick={() => setLanguage(language === 'EN' ? 'HI' : 'EN')}>🌐 {language}</button>
            <button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? '☀️' : '🌙'}</button>
          </div>
        </header>

        <div className="content-wrap">
          {active === 'chat' && (
            <ChatView
              greeting={greeting}
              messages={messages}
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              listening={listening}
              setListening={setListening}
              location={location}
            />
          )}
          {active === 'forecast' && <ForecastView location={location} />}
          {active === 'alerts' && <AlertsView location={location} />}
          {active === 'advisory' && <AdvisoryView location={location} />}
          {active === 'climate' && <ClimateView location={location} />}
          {active === 'voice' && <VoiceView listening={listening} setListening={setListening} />}
          {active === 'history' && <HistoryView onSelect={(text) => { setActive('chat'); sendMessage(text) }} />}
        </div>
      </main>

      {showLocation && <LocationModal value={location} onClose={() => setShowLocation(false)} onChange={(value) => { setLocation(value); setShowLocation(false) }} />}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  )
}

function NavItem({ active, icon, label, badge, onClick }) {
  return <button className={active ? 'nav-item active' : 'nav-item'} onClick={onClick}><Icon>{icon}</Icon><span>{label}</span>{badge && <b>{badge}</b>}</button>
}

function ChatView({ greeting, messages, input, setInput, sendMessage, listening, setListening, location }) {
  return (
    <section className="chat-page">
      <div className={messages.length ? 'chat-stream has-messages' : 'chat-stream'}>
        {messages.length === 0 ? (
          <div className="welcome-block">
            <div className="weather-orb">☁️</div>
            <p className="eyebrow">{location}</p>
            <h1>{greeting}<br /><span>How can I help you today?</span></h1>
            <p className="welcome-copy">Ask me anything about weather, forecasts, warnings, or climate.</p>
            <div className="quick-grid">
              {quickPrompts.map((item) => <button key={item.text} className="quick-prompt" onClick={() => sendMessage(item.text)}><span>{item.icon}</span>{item.text}</button>)}
            </div>
          </div>
        ) : (
          <div className="messages">
            {messages.map((message, index) => (
              <div className={message.role === 'user' ? 'message-row user' : 'message-row assistant'} key={`${message.text}-${index}`}>
                {message.role === 'assistant' && <div className="assistant-avatar">☁</div>}
                <div className="message-content">
                  <div className="message-name">{message.role === 'user' ? 'You' : 'WeatherGPT'}</div>
                  <div className="message-text">{message.text}</div>
                  {message.role === 'assistant' && <ResponseCard type={message.card} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Composer input={input} setInput={setInput} sendMessage={sendMessage} listening={listening} setListening={setListening} />
      <p className="disclaimer">WeatherGPT provides informational guidance. For emergencies, follow official local warnings.</p>
    </section>
  )
}

function Composer({ input, setInput, sendMessage, listening, setListening }) {
  return <div className="composer-wrap">
    <div className={listening ? 'composer listening' : 'composer'}>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} placeholder="Ask WeatherGPT anything..." rows="1" />
      <button className={listening ? 'mic-btn active' : 'mic-btn'} onClick={() => setListening(!listening)} aria-label="Voice input">🎙️</button>
      <button className="send-btn" onClick={() => sendMessage()} aria-label="Send">↑</button>
    </div>
    <div className="composer-hints"><span>Try: “Will it rain tomorrow?”</span><span>Enter to send · Shift + Enter for a new line</span></div>
  </div>
}

function ResponseCard({ type }) {
  if (type === 'alert') return <div className="response-card alert-card"><div className="card-title"><span>🚨</span><strong>Weather alerts</strong><span className="status-pill danger">2 active</span></div><p>No critical warning is shown in this demo for your selected location. Official alerts will appear here when connected.</p><button>View all alerts →</button></div>
  if (type === 'advisory') return <div className="response-card advisory-card"><div className="card-title"><span>🌾</span><strong>Farming advisory</strong></div><div className="advice-good">✓ Conditions look suitable</div><div className="mini-stats"><span>🌡️ 25–31°C</span><span>💧 78%</span><span>💨 18 km/h</span></div><p>Keep checking the rain window before spraying or harvesting.</p></div>
  if (type === 'climate') return <div className="response-card climate-card"><div className="card-title"><span>📈</span><strong>Climate insight</strong></div><div className="trend-line"><span>2004</span><div className="spark"><i /><i /><i /><i /><i /><i /><i /></div><span>2024</span></div><p>Historical analysis will appear here when the climate dataset is connected.</p></div>
  return <div className="response-card weather-card"><div className="weather-main"><span className="big-weather">🌦️</span><div><strong>29°C</strong><span>Feels like 32°C</span></div><div className="weather-separator" /><div><b>Rain</b><span>70% tomorrow</span></div></div><div className="hour-row">{hourly.slice(0, 5).map(([time, icon, temp]) => <div key={time}><small>{time}</small><span>{icon}</span><b>{temp}°</b></div>)}</div></div>
}

function ForecastView({ location }) {
  return <Page title="Forecast" subtitle={`7-day weather outlook for ${location}`} icon="🌤️"><div className="current-strip"><div><span className="big-current">⛅</span><div><strong>29°C</strong><span>Partly cloudy · Feels like 32°C</span></div></div><div className="current-metrics"><span>💧 78% humidity</span><span>💨 18 km/h wind</span><span>☀️ UV 6</span></div></div><div className="section-heading"><div><h2>7-day forecast</h2><p>Simple view of what is coming.</p></div><div className="unit-toggle"><button className="selected">°C</button><button>°F</button></div></div><div className="forecast-list">{forecast.map((item) => <div className="forecast-row" key={item.date}><div className="day"><strong>{item.day}</strong><small>{item.date}</small></div><span className="forecast-icon">{item.icon}</span><div className="temp"><strong>{item.high}°</strong><span>{item.low}°</span></div><div className="rain"><span>💧</span>{item.rain}%</div><div className="rain-bar"><i style={{ width: `${item.rain}%` }} /></div></div>)}</div></Page>
}

function AlertsView({ location }) {
  return <Page title="Weather alerts" subtitle={`Warnings and safety information for ${location}`} icon="🚨"><div className="alert-hero"><div className="alert-icon">⚠️</div><div><span className="status-pill danger">Example warning</span><h2>Heavy rain may develop</h2><p>This prototype shows how official warnings can be presented clearly. Live warning data will come from your backend.</p></div><button className="outline-btn">Details →</button></div><div className="alert-list"><AlertItem icon="⛈️" title="Thunderstorm" time="Today · 1 PM – 7 PM" /><AlertItem icon="💨" title="Strong winds" time="Today · 10 AM – 8 PM" /><AlertItem icon="🌊" title="Flood information" time="Tap to check local risk" /></div><div className="source-note">🔐 Safety note: emergency decisions should use official meteorological and disaster-management alerts.</div></Page>
}

function AlertItem({ icon, title, time }) { return <button className="alert-item"><span>{icon}</span><div><strong>{title}</strong><small>{time}</small></div><span>›</span></button> }

function AdvisoryView({ location }) {
  return <Page title="Advisories" subtitle="Weather guidance for real-world decisions" icon="🌾"><div className="advisory-tabs"><button className="active">🌾 Farming</button><button>✈️ Aviation</button><button>🌊 Marine</button><button>🏙️ Urban</button></div><div className="advisory-main"><div className="advisory-banner"><span>🌱</span><div><strong>Conditions are suitable for outdoor work</strong><p>For {location}. Always check the latest forecast before making a safety-critical decision.</p></div></div><div className="advisory-grid"><Metric label="Temperature" value="25° – 31°C" icon="🌡️" /><Metric label="Rain expected" value="12 mm" icon="💧" /><Metric label="Humidity" value="78%" icon="💦" /><Metric label="Wind speed" value="18 km/h" icon="💨" /></div><div className="tip-box">💡 <strong>Tip:</strong> WeatherGPT can turn raw forecast data into simple, location-specific advisories.</div></div></Page>
}

function Metric({ label, value, icon }) { return <div className="metric"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div> }

function ClimateView({ location }) {
  const points = [18, 25, 21, 32, 28, 40, 36, 49, 45, 57, 52, 66]
  return <Page title="Climate insights" subtitle={`Historical analysis for ${location}`} icon="📈"><div className="filter-row"><button>20 years⌄</button><button>Temperature⌄</button><button>Annual trend⌄</button></div><div className="climate-card-large"><div className="chart-header"><div><small>Average temperature trend</small><strong>2004 – 2024</strong></div><span className="trend-up">↗ +1.2°C illustrative</span></div><div className="chart"><div className="y-labels"><span>32°C</span><span>30°C</span><span>28°C</span><span>26°C</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /></div><div className="chart-line">{points.map((point, index) => <span key={index} style={{ bottom: `${point}%` }} />)}</div></div><div className="x-labels"><span>2004</span><span>2009</span><span>2014</span><span>2019</span><span>2024</span></div></div><div className="insight-box">💡 <div><strong>Insight</strong><p>The connected historical dataset can help researchers explore long-term temperature, rainfall, and extreme-weather trends.</p></div></div></div></Page>
}

function VoiceView({ listening, setListening }) {
  return <Page title="Voice WeatherGPT" subtitle="Ask questions hands-free in supported languages" icon="🎙️"><div className={listening ? 'voice-panel listening' : 'voice-panel'}><div className="voice-rings"><div className="voice-mic">🎙️</div></div><h2>{listening ? 'Listening...' : 'Speak naturally'}</h2><p>{listening ? 'Try: “Will it rain tomorrow?”' : 'Tap the microphone and ask about the weather.'}</p><button className="voice-action" onClick={() => setListening(!listening)}>{listening ? '■ Stop listening' : '🎙️ Start speaking'}</button></div><div className="language-cards"><div>🇮🇳 <strong>Indian languages</strong><span>Hindi · Bengali · Tamil · Telugu · Marathi</span></div><div>🔊 <strong>Voice response</strong><span>WeatherGPT can read answers aloud for accessibility.</span></div></div></Page>
}

function HistoryView({ onSelect }) {
  return <Page title="Chat history" subtitle="Continue a previous weather conversation" icon="🕘"><div className="history-search">⌕ <input placeholder="Search conversations..." /></div><div className="history-list">{history.map(([text, time]) => <button key={text} onClick={() => onSelect(text)} className="history-item"><span className="history-bubble">💬</span><div><strong>{text}</strong><small>{time}</small></div><span>›</span></button>)}</div></Page>
}

function Page({ title, subtitle, icon, children }) {
  return <section className="page"><div className="page-heading"><div className="page-icon">{icon}</div><div><h1>{title}</h1><p>{subtitle}</p></div></div>{children}</section>
}

function LocationModal({ value, onClose, onChange }) {
  const locations = ['Kolkata, India', 'Mumbai, India', 'Delhi, India', 'Bengaluru, India', 'Chennai, India']
  return <Modal onClose={onClose} title="Choose your location"><div className="location-search">⌕<input autoFocus placeholder="Search city or location..." /></div><button className="current-location" onClick={() => onChange('Current location')}>⌖ Use my current location</button><p className="modal-label">Recent locations</p>{locations.map((item) => <button className={item === value ? 'location-option selected' : 'location-option'} key={item} onClick={() => onChange(item)}><span>⌖</span>{item}{item === value && <span>✓</span>}</button>)}</Modal>
}

function ProfileModal({ onClose }) { return <Modal onClose={onClose} title="Preferences"><div className="preference"><span>🌐 Language</span><strong>English (EN) ›</strong></div><div className="preference"><span>🌡️ Units</span><strong>Celsius (°C) ›</strong></div><div className="preference"><span>🔔 Alerts</span><strong>On ›</strong></div><div className="preference"><span>🔊 Voice</span><strong>Available ›</strong></div></Modal> }

function Modal({ onClose, title, children }) { return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-header"><h2>{title}</h2><button onClick={onClose}>×</button></div>{children}</div></div> }

export default App
