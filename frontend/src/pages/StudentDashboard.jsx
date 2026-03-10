import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { coursesAPI, usersAPI } from '../services/api'

const TAB_ALL      = 'all'
const TAB_ENROLLED = 'enrolled'

export default function StudentDashboard() {
  const [tab,      setTab]      = useState(TAB_ALL)

  // ── All courses ────────────────────────────────────────────────────────
  const [courses,  setCourses]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [search,   setSearch]   = useState('')

  const fetchCourses = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const res = await coursesAPI.getAll(q)
      setCourses(res.data.data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Enrolled courses ───────────────────────────────────────────────────
  const [enrolled,      setEnrolled]      = useState([])
  const [loadEnrolled,  setLoadEnrolled]  = useState(false)

  const fetchEnrolled = useCallback(async () => {
    setLoadEnrolled(true)
    try {
      const res = await usersAPI.myEnrolledCourses()
      setEnrolled(res.data.data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoadEnrolled(false)
    }
  }, [])

  useEffect(() => { fetchCourses() }, [fetchCourses])
  useEffect(() => { fetchEnrolled() }, [fetchEnrolled])

  function handleSearch(e) {
    e.preventDefault()
    fetchCourses(search)
  }
  function clearSearch() {
    setSearch('')
    fetchCourses('')
  }

  // ── Tab button style ───────────────────────────────────────────────────
  const tabStyle = (t) => ({
    padding: '.45rem 1.2rem',
    border: 'none',
    borderBottom: tab === t ? '3px solid var(--primary)' : '3px solid transparent',
    background: 'none',
    fontWeight: tab === t ? 700 : 400,
    color: tab === t ? 'var(--primary)' : 'var(--muted)',
    cursor: 'pointer',
    fontSize: '.95rem',
  })

  return (
    <>
      <Navbar />

      <div className="page container">
        {/* Header */}
        <div className="dashboard-header">
          <h2 style={{ fontSize: '1.3rem' }}>Student Dashboard</h2>

          {tab === TAB_ALL && (
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                placeholder="Search by name or code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
              {search && (
                <button type="button" className="btn btn-secondary" onClick={clearSearch}>
                  Clear
                </button>
              )}
            </form>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
          <button style={tabStyle(TAB_ALL)}      onClick={() => setTab(TAB_ALL)}>
            📚 All Courses
          </button>
          <button style={tabStyle(TAB_ENROLLED)} onClick={() => setTab(TAB_ENROLLED)}>
            ✅ My Enrollments
            {enrolled.length > 0 && (
              <span style={{
                marginLeft: '.4rem', background: 'var(--primary)', color: '#fff',
                borderRadius: '99px', padding: '.05rem .5rem', fontSize: '.75rem',
              }}>
                {enrolled.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Tab: All Courses ─────────────────────────────────────────── */}
        {tab === TAB_ALL && (
          <>
            <div style={{
              background: '#e0e7ff', borderLeft: '4px solid var(--primary)',
              borderRadius: 'var(--radius)', padding: '.75rem 1rem',
              marginBottom: '1.2rem', color: '#3730a3', fontSize: '.9rem',
            }}>
              Read-only catalog. Contact a teacher to get enrolled.
            </div>
            <div className="card">
              {loading ? (
                <p className="loading">Loading courses…</p>
              ) : courses.length === 0 ? (
                <p className="empty-msg">No courses available yet.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Course Name</th>
                        <th>Code</th>
                        <th>Credits</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c, idx) => (
                        <tr key={c.id}>
                          <td>{idx + 1}</td>
                          <td>{c.name}</td>
                          <td><code>{c.code}</code></td>
                          <td><span className="tag-credits">{c.credits} cr</span></td>
                          <td>{new Date(c.updated_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Tab: My Enrollments ──────────────────────────────────────── */}
        {tab === TAB_ENROLLED && (
          <div className="card">
            {loadEnrolled ? (
              <p className="loading">Loading…</p>
            ) : enrolled.length === 0 ? (
              <p className="empty-msg">You are not enrolled in any course yet.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Course Name</th>
                      <th>Code</th>
                      <th>Credits</th>
                      <th>Enrolled On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolled.map((e, idx) => (
                      <tr key={e.enrollment_id}>
                        <td>{idx + 1}</td>
                        <td>{e.name}</td>
                        <td><code>{e.code}</code></td>
                        <td><span className="tag-credits">{e.credits} cr</span></td>
                        <td>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
