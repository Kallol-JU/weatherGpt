export function History({ history, onSelect }) {
 return <section className="page-section"><div className="section-title"><div><h1>Chat history</h1><p>Continue a previous WeatherGPT conversation.</p></div></div><div className="history-card">{history.length===0?<div className="empty-state">No saved conversations yet.</div>:history.map((item,i)=><button className="history-row" key={i} onClick={()=>onSelect(item.message)}><span>💬</span><div><strong>{item.message}</strong><small>{item.timestamp?new Date(item.timestamp).toLocaleString():''}</small></div><b>›</b></button>)}</div></section>
}
