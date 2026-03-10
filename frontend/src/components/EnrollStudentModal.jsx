import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { enrollmentsAPI, usersAPI } from '../services/api'

export default function EnrollStudentModal({ course, onClose }) {
  const [enrolled, setEnrolled] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    fetchEnrolled()
  }, [course.id])

  async function fetchEnrolled() {
    setLoading(true)
    try {
      const res = await enrollmentsAPI.list(course.id)
      setEnrolled(res.data.data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await usersAPI.searchStudents(query)
        const enrolledIds = new Set(enrolled.map((e) => e.student_id))
        setSuggestions(res.data.data.filter((s) => !enrolledIds.has(s.id)))
      } catch (_) {
        setSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, enrolled])

  async function handleEnroll(username) {
    setEnrolling(true)
    try {
      await enrollmentsAPI.enroll(course.id, username)
      toast.success(`${username} successfully enrolled!`)
      setQuery('')
      setSuggestions([])
      fetchEnrolled()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setEnrolling(false)
    }
  }

  async function handleRemove(enrollmentId, username) {
    if (!window.confirm(`Remove ${username} from this course?`)) return
    setRemovingId(enrollmentId)
    try {
      await enrollmentsAPI.remove(course.id, enrollmentId)
      toast.success(`${username} removed from course`)
      fetchEnrolled()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal" 
        style={{ maxWidth: '560px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3>Manage Enrollment</h3>
            <p className="modal-subtitle">
              {course.name} <code style={{ marginLeft: '0.5rem' }}>{course.code}</code>
            </p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Search & Enroll */}
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
            Add Student by Username
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              style={{
                flex: 1, padding: '0.85rem 1.25rem',
                border: '1px solid var(--border)', borderRadius: '999px',
                fontSize: '0.95rem', outline: 'none', background: 'var(--bg)'
              }}
              placeholder="Search username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button
              className="btn btn-primary"
              disabled={!query.trim() || enrolling}
              onClick={() => handleEnroll(query.trim())}
            >
              {enrolling ? 'Enrolling...' : 'Enroll'}
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <ul style={{
              position: 'absolute', top: '100%', left: 0, right: '100px', marginTop: '0.5rem',
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: '16px', boxShadow: 'var(--shadow-lg)',
              listStyle: 'none', margin: 0, padding: '0.5rem', zIndex: 10,
            }}>
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    style={{
                      width: '100%', background: 'none', border: 'none',
                      padding: '0.75rem 1rem', textAlign: 'left', cursor: 'pointer',
                      fontSize: '0.95rem', borderRadius: '8px', color: 'var(--text)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    onClick={() => { setQuery(s.username); setSuggestions([]) }}
                  >
                    <strong style={{ display: 'block', marginBottom: '0.2rem' }}>{s.username}</strong>
                    <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{s.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Enrolled Students List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>
              Enrolled Students
            </h4>
            <span style={{ background: 'var(--primary-light)', color: 'var(--primary-text)', padding: '0.2rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {enrolled.length}
            </span>
          </div>

          {loading ? (
            <div className="loading" style={{ padding: '2rem' }}>Loading Enrollment</div>
          ) : enrolled.length === 0 ? (
            <div className="empty-msg" style={{ padding: '2rem', background: 'var(--bg)', borderRadius: '12px' }}>
              No students are currently enrolled.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {enrolled.map((e) => (
                <li
                  key={e.enrollment_id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem', borderRadius: '16px',
                    border: '1px solid var(--border)', background: 'var(--card)',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(ev) => ev.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={(ev) => ev.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem' }}>{e.username}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{e.email}</div>
                  </div>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'transparent' }}
                    disabled={removingId === e.enrollment_id}
                    onClick={() => handleRemove(e.enrollment_id, e.username)}
                  >
                    {removingId === e.enrollment_id ? '...' : 'Remove'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}