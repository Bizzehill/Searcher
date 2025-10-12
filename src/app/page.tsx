import Link from 'next/link'

export default function Page() {
  return (
    <section className="card">
      <h2>Welcome to Good List</h2>
      <p>
        Kids build a Christmas wish list while earning <strong>goodness points</strong>
        for real-world deeds. Parents guide with a thoughtful budget and approvals.
      </p>
      <div className="grid2">
        <Link className="btn" href="/santa">Enter Santa View</Link>
        <Link className="btn" href="/parent">Parent Dashboard</Link>
      </div>
    </section>
  )
}
