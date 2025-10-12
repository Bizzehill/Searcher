'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import GoodnessMeter from '@/components/GoodnessMeter'
import WishItemCard, { WishItem } from '@/components/WishItemCard'

export default function SantaPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<any[]>([])
  const [childId, setChildId] = useState<string>('')
  const [settings, setSettings] = useState<{ maxGifts: number; pointsPerGift: number; approvedPoints: number; age: number }>({ maxGifts: 3, pointsPerGift: 20, approvedPoints: 0, age: 8 })
  const [wishlist, setWishlist] = useState<WishItem[]>([])
  const [newItem, setNewItem] = useState({ name: '', price: '', url: '', image: '' })
  const [deed, setDeed] = useState({ description: '', points: '5' })
  const [ideasText, setIdeasText] = useState<string>('')
  const [interests, setInterests] = useState<string>('')
  const [loadingIdeas, setLoadingIdeas] = useState(false)

  useEffect(() => {
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'children')
    const unsub = onSnapshot(ref, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setChildren(list)
      setChildId(prev => prev || (list[0]?.id ?? ''))
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!user || !childId) return
    const sRef = doc(db, 'users', user.uid, 'children', childId)
    const unsubS = onSnapshot(sRef, d => {
      const data: any = d.data() || {}
      setSettings({
        maxGifts: data.maxGifts ?? 3,
        pointsPerGift: data.pointsPerGift ?? 20,
        approvedPoints: data.approvedPoints ?? 0,
        age: data.age ?? 8,
      })
    })
    const wRef = query(collection(db, 'users', user.uid, 'children', childId, 'wishlist'), orderBy('createdAt','desc'))
    const unsubW = onSnapshot(wRef, snap => {
      setWishlist(
        snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<WishItem, 'id'>) })) as WishItem[]
      )
    })
    return () => { unsubS(); unsubW() }
  }, [user, childId])

  const addWish = async () => {
    if (!user || !childId || !newItem.name.trim()) return
    await addDoc(collection(db, 'users', user.uid, 'children', childId, 'wishlist'), {
      name: newItem.name.trim(),
      price: newItem.price ? Number(newItem.price) : null,
      url: newItem.url || null,
      image: newItem.image || null,
      status: 'wants',
      createdAt: serverTimestamp(),
    })
    setNewItem({ name: '', price: '', url: '', image: '' })
  }

  const submitDeed = async () => {
    if (!user || !childId || !deed.description.trim()) return
    await addDoc(collection(db, 'users', user.uid, 'children', childId, 'deeds'), {
      description: deed.description.trim(),
      points: Number(deed.points) || 5,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
    setDeed({ description: '', points: '5' })
    alert('Deed submitted! A parent will review it soon.')
  }

  const fetchIdeas = async () => {
    try {
      setLoadingIdeas(true)
      const res = await fetch('/api/elf-helper', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ age: settings.age, interests: interests.split(',').map(s=>s.trim()).filter(Boolean), mode: 'deeds' }) })
      const json = await res.json()
      if (json.ok) setIdeasText(json.text)
      else setIdeasText(json.error || 'Something went wrong')
    } catch (e:any) {
      setIdeasText(e.message || 'Network error')
    } finally {
      setLoadingIdeas(false)
    }
  }

  if (!user) {
    return (
      <section className="card">
        <h2>Santa View</h2>
        <p>To protect your family’s privacy, please <Link className="link" href="/login">sign in</Link> first.</p>
      </section>
    )
  }

  return (
    <section className="card">
      <h2>Santa View ✨</h2>
      <label>
        Choose child:
        <select value={childId} onChange={e=>setChildId(e.target.value)}>
          {children.map(c=> <option key={c.id} value={c.id}>{c.name ?? c.id}</option>)}
        </select>
      </label>

      <GoodnessMeter approvedPoints={settings.approvedPoints} pointsPerGift={settings.pointsPerGift} maxGifts={settings.maxGifts} />

      <div className="grid2">
        <div className="card">
          <h3>Add Wish Item</h3>
          <label>Item name<input value={newItem.name} onChange={e=>setNewItem({...newItem, name:e.target.value})} placeholder="Lego set, story Bible, mittens"/></label>
          <label>Price (optional)<input value={newItem.price} onChange={e=>setNewItem({...newItem, price:e.target.value})} type="number" min="0" step="0.01"/></label>
          <label>Link (optional)<input value={newItem.url} onChange={e=>setNewItem({...newItem, url:e.target.value})} placeholder="https://..."/></label>
          <label>Image URL (optional)<input value={newItem.image} onChange={e=>setNewItem({...newItem, image:e.target.value})} placeholder="https://..."/></label>
          <button className="btn" onClick={addWish}>Add to List</button>
        </div>
        <div className="card">
          <h3>Log a Good Deed</h3>
          <label>What did you do?<nobr></nobr><input value={deed.description} onChange={e=>setDeed({...deed, description:e.target.value})} placeholder="Helped with dishes, shared toys, prayed for a friend..."/></label>
          <label>Points<select value={deed.points} onChange={e=>setDeed({...deed, points:e.target.value})}>
            {[2,5,10,15,20].map(n=> <option key={n} value={n}>{n}</option>)}
          </select></label>
          <button className="btn" onClick={submitDeed}>Submit Deed</button>
        </div>
      </div>

      <div className="card">
        <h3>Need Ideas?</h3>
        <p>Elf Helper can suggest age-appropriate, faith-friendly good deeds.</p>
        <label>Child interests (comma-separated)<input value={interests} onChange={e=>setInterests(e.target.value)} placeholder="music, sports, animals"/></label>
        <button className="btn" onClick={fetchIdeas} disabled={loadingIdeas}>{loadingIdeas ? 'Thinking…' : 'Get Deed Ideas'}</button>
        {ideasText && (
          <pre style={{whiteSpace:'pre-wrap', background:'#0e1628', padding:12, borderRadius:8, marginTop:8}}>{ideasText}</pre>
        )}
      </div>

      <h3>My Wish List</h3>
      <div className="grid3">
        {wishlist.map(w=> <WishItemCard key={w.id} item={w} />)}
      </div>
    </section>
  )
}
