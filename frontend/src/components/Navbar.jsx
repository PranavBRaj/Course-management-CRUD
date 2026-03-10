// Navbar.jsx
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { usersAPI } from '../services/api'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [enrolled, setEnrolled] = useState([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Fetch enrollments EVERY TIME the dropdown is opened to ensure fresh data
  useEffect(() => {
    if (user && user.role === 'student' && dropdownOpen) {
      fetchEnrolled()
    }
  }, [dropdownOpen, user])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchEnrolled() {
    setLoading(true)
    try {
      const res = await usersAPI.myEnrolledCourses()
      setEnrolled(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <nav className="navbar">
      <h1>
        <div className="navbar-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
          </svg>
        </div>
        Nous Tech 
      </h1>
      <div className="nav-right">
        {user && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text)', paddingBottom: '0' }}>{user.username}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'capitalize' }}>{user.role}</span>
            </div>
            
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button 
                className="badge" 
                style={{ 
                  background: 'var(--primary-light)',
                  color: 'var(--primary-text)',
                  border: 'none', 
                  cursor: user.role === 'student' ? 'pointer' : 'default',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  padding: 0,
                  borderRadius: '50%',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'var(--transition)'
                }}
                onClick={() => user.role === 'student' ? setDropdownOpen(!dropdownOpen) : null}
                title={user.role === 'student' ? "View Enrollments" : ""}
              >
                {user.username.charAt(0).toUpperCase()}
              </button>

              {user.role === 'student' && dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '340px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 1000,
                  padding: '1.25rem',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text)' }}>My Enrollments</h4>
                    <span style={{ background: 'var(--primary)', color: '#1c1917', padding: '0.15rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {enrolled.length}
                    </span>
                  </div>

                  {loading ? (
                    <div className="loading" style={{ padding: '1.5rem', fontSize: '0.9rem' }}>Loading data...</div>
                  ) : enrolled.length === 0 ? (
                    <p className="empty-msg" style={{ padding: '1.5rem', fontSize: '0.85rem' }}>No courses enrolled yet.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {enrolled.map(c => (
                        <li key={c.enrollment_id} style={{ 
                          background: 'var(--bg)', 
                          padding: '1rem', 
                          borderRadius: '12px',
                          border: '1px solid var(--border)'
                        }}>
                          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                            {c.name}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <code style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>{c.code}</code>
                            <span className="tag-credits" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>{c.credits} cr</span>
                          </div>
                          <div style={{ color: 'var(--muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            Enrolled: {new Date(c.enrolled_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              className="btn btn-danger"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', marginLeft: '0.5rem' }}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  )
}