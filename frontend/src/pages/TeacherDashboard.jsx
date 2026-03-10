import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import CourseFormModal from '../components/CourseFormModal'
import EnrollStudentModal from '../components/EnrollStudentModal'
import { coursesAPI } from '../services/api'

export default function TeacherDashboard() {
  const [courses, setCourses]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editCourse, setEditCourse] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [enrollCourse, setEnrollCourse] = useState(null)

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

  useEffect(() => { fetchCourses() }, [fetchCourses])

  function handleSearch(e) {
    e.preventDefault()
    fetchCourses(search)
  }
  
  function clearSearch() {
    setSearch('')
    fetchCourses('')
  }

  async function handleSubmit(data) {
    try {
      if (editCourse) {
        await coursesAPI.update(editCourse.id, data)
        toast.success('Course updated successfully!')
      } else {
        await coursesAPI.create(data)
        toast.success('New course created!')
      }
      setModalOpen(false)
      setEditCourse(null)
      fetchCourses(search)
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  async function handleDelete(course) {
    if (!window.confirm(`Are you sure you want to delete "${course.name}"? This action cannot be undone.`)) return
    setDeletingId(course.id)
    try {
      await coursesAPI.remove(course.id)
      toast.success('Course deleted')
      fetchCourses(search)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Navbar />
      <div className="page container">
        <div className="dashboard-header">
          <h2>Instructor Dashboard</h2>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary">Search</button>
              {search && (
                <button type="button" className="btn btn-secondary" onClick={clearSearch} style={{ padding: '0.6rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </form>
            <button
              className="btn btn-primary"
              onClick={() => { setEditCourse(null); setModalOpen(true) }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Course
            </button>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading">Loading dashboard</div>
          ) : courses.length === 0 ? (
            <div className="empty-msg">
              <div style={{ display: 'inline-block', padding: '1.5rem', background: 'var(--primary-light)', borderRadius: '50%', marginBottom: '1rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-text)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </div>
              <p>No courses found. Create your first course to get started!</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Code</th>
                    <th>Credits</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id}>
                      <td><strong style={{ color: 'var(--text)' }}>{c.name}</strong></td>
                      <td><code>{c.code}</code></td>
                      <td><span className="tag-credits">{c.credits} cr</span></td>
                      <td style={{ color: 'var(--muted)' }}>{new Date(c.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                            onClick={() => setEnrollCourse(c)}
                            title="Manage Students"
                          >
                            Enroll
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                            onClick={() => { setEditCourse(c); setModalOpen(true) }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                            disabled={deletingId === c.id}
                            onClick={() => handleDelete(c)}
                          >
                            {deletingId === c.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <CourseFormModal
          course={editCourse}
          onClose={() => { setModalOpen(false); setEditCourse(null) }}
          onSubmit={handleSubmit}
        />
      )}

      {enrollCourse && (
        <EnrollStudentModal
          course={enrollCourse}
          onClose={() => setEnrollCourse(null)}
        />
      )}
    </>
  )
}