'use client'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import WishItemCard, { WishItem } from '@/components/WishItemCard'

type Deed = {
  id: string
  description: string
  points: number
  status: 'pending' | 'approved' | 'rejected'
}

export default function ParentPage() {
  const { user, logOut } = useAuth()
  const [children, setChildren] = useState<any[]>([])
  const [childId, setChildId] = useState<string>('')
  const [newChildName, setNewChildName] = useState('')
  const [pendingDeeds, setPendingDeeds] = useState<Deed[]>([])
  const [wishlist, setWishlist] = useState<WishItem[]>([])
  const [settings, setSettings] = useState({ maxGifts: 3, pointsPerGift: 20, approvedPoints: 0, age: 8 })

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
    const cRef = doc(db, 'users', user.uid, 'children', childId)
    const unsubC = onSnapshot(cRef, d => {
      const data:any = d.data() || {}
      setSettings({
        maxGifts: data.maxGifts ?? 3,
        pointsPerGift: data.pointsPerGift ?? 20,
        approvedPoints: data.approvedPoints ?? 0,
        age: data.age ?? 8,
      })
    })
    const dRef = query(collection(db, 'users', user.uid, 'children', childId, 'deeds'), orderBy('createdAt','desc'))
    const unsubD = onSnapshot(dRef, snap => {
      setPendingDeeds(
        snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Deed, 'id'>) })) as Deed[]
      )
    })
    const wRef = query(collection(db, 'users', user.uid, 'children', childId, 'wishlist'), orderBy('createdAt','desc'))
    const unsubW = onSnapshot(wRef, snap => {
      setWishlist(
        snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<WishItem, 'id'>) })) as WishItem[]
      )
    })
    return () => { unsubC(); unsubD(); unsubW() }
  }, [user, childId])

  const addChild = async () => {
    if (!user || !newChildName.trim()) return
    await addDoc(collection(db, 'users', user.uid, 'children'), {
      name: newChildName.trim(),
      maxGifts: 3,
      pointsPerGift: 20,
      approvedPoints: 0,
      age: 8,
      createdAt: serverTimestamp(),
    })
    setNewChildName('')
  }

  const updateSettings = async (patch: Partial<typeof settings>) => {
    if (!user || !childId) return
    await updateDoc(doc(db, 'users', user.uid, 'children', childId), patch as any)
  }

  const approveDeed = async (id: string, points: number) => {
    if (!user || !childId) return
    await updateDoc(doc(db, 'users', user.uid, 'children', childId, 'deeds', id), { status: 'approved' } as any)
    await updateDoc(doc(db, 'users', user.uid, 'children', childId), { approvedPoints: (settings.approvedPoints || 0) + points } as any)
  }

  const rejectDeed = async (id: string) => {
    if (!user || !childId) return
    await updateDoc(doc(db, 'users', user.uid, 'children', childId, 'deeds', id), { status: 'rejected' } as any)
  }

  const updateItemStatus = async (itemId: string, status: WishItem['status']) => {
    if (!user || !childId) return
    await updateDoc(doc(db, 'users', user.uid, 'children', childId, 'wishlist', itemId), { status } as any)
  }

  if (!user) {
    return (
      <section className="card">
        <h2>Parent Dashboard</h2>
        <p>Please <Link className="link" href="/login">sign in</Link> to manage your family account.</p>
      </section>
    )
  }

  return (
    <section className="card">
      <div className="row between">
        <h2>Parent Dashboard</h2>
        <button className="btn secondary" onClick={logOut}>Sign out</button>
      </div>

      <div className="card">
        <h3>Children</h3>
        <div className="row">
          <select value={childId} onChange={e=>setChildId(e.target.value)}>
            {children.map(c=> <option key={c.id} value={c.id}>{c.name ?? c.id}</option>)}
          </select>
          <input value={newChildName} onChange={e=>setNewChildName(e.target.value)} placeholder="Add a child name"/>
          <button className="btn" onClick={addChild}>Add</button>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Goodness Settings</h3>
          <label>Max gifts<input type="number" min={1} value={settings.maxGifts} onChange={e=>updateSettings({ maxGifts:Number(e.target.value) })}/></label>
          <label>Points per gift<input type="number" min={1} value={settings.pointsPerGift} onChange={e=>updateSettings({ pointsPerGift:Number(e.target.value) })}/></label>
          <label>Child age<input type="number" min={1} value={settings.age} onChange={e=>updateSettings({ age:Number(e.target.value) })}/></label>
          <p>Approved points so far: <strong>{settings.approvedPoints}</strong></p>
        </div>

        <div className="card">
          <h3>Pending Deeds</h3>
          {pendingDeeds.length===0 && <p>No deeds yet.</p>}
          <ul className="list">
            {pendingDeeds.map(d => (
              <li key={d.id} className={`list-item ${d.status}`}>
                <div>
                  <strong>{d.description}</strong> — {d.points} pts
                </div>
                <div className="row">
                  {d.status==='pending' ? (
                    <>
                      <button className="btn" onClick={()=>approveDeed(d.id, d.points)}>Approve</button>
                      <button className="btn secondary" onClick={()=>rejectDeed(d.id)}>Reject</button>
                    </>
                  ) : (
                    <span className={`badge ${d.status}`}>{d.status}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <h3>Wish List</h3>
        <div className="grid3">
          {wishlist.map(w => (
            <WishItemCard key={w.id} item={w} onStatus={(s)=>updateItemStatus(w.id, s)} />
          ))}
        </div>
      </div>
    </section>
  )
}
