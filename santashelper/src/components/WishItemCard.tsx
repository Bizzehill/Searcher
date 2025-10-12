'use client'
import React from 'react'

export type WishItem = {
  id: string
  name: string
  price?: number
  url?: string
  image?: string
  status: 'wants' | 'purchased' | 'passed'
}

export default function WishItemCard({ item, onStatus }: { item: WishItem; onStatus?: (s: WishItem['status']) => void }) {
  return (
    <div className="card item">
      <div className="item-top">
        <div>
          <h4>{item.name}</h4>
          {item.price != null && <p>${item.price.toFixed(2)}</p>}
          {item.url && <a className="link" href={item.url} target="_blank" rel="noreferrer">View link</a>}
        </div>
        {item.image && <img src={item.image} alt={item.name} width={96} height={96} style={{objectFit:'cover', borderRadius:8}}/>}
      </div>
      {onStatus && (
        <div className="chips">
          <button className={`chip ${item.status==='wants'?'active':''}`} onClick={()=>onStatus('wants')}>Wants</button>
          <button className={`chip ${item.status==='purchased'?'active':''}`} onClick={()=>onStatus('purchased')}>Purchased</button>
          <button className={`chip ${item.status==='passed'?'active':''}`} onClick={()=>onStatus('passed')}>Pass</button>
        </div>
      )}
    </div>
  )
}
