import { useState, useEffect } from 'react'

const EMPTY = { name: '', code: '', credits: '' }

export default function CourseFormModal({ course, onClose, onSubmit }) {
  const isEdit = Boolean(course)
  const [form, setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (course) {
      setForm({ name: course.name, code: course.code, credits: String(course.credits) })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [course])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  function validate() {
    const errs = {}
    if (!form.name.trim())  errs.name    = 'Course name is required'
    if (!form.code.trim())  errs.code    = 'Course code is required'
    const c = parseInt(form.credits, 10)
    if (!form.credits || isNaN(c) || c <= 0)
      errs.credits = 'Credits must be a positive number'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await onSubmit({
        name:    form.name.trim(),
        code:    form.code.trim().toUpperCase(),
        credits: parseInt(form.credits, 10),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{isEdit ? 'Edit Course' : 'Create New Course'}</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course Name</label>
            <input
              name="name"
              placeholder="e.g. Introduction to Python"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Course Code</label>
            <input
              name="code"
              placeholder="e.g. CS101"
              value={form.code}
              onChange={handleChange}
            />
            {errors.code && <span className="error">{errors.code}</span>}
          </div>

          <div className="form-group">
            <label>Credits</label>
            <input
              name="credits"
              type="number"
              min="1"
              placeholder="e.g. 3"
              value={form.credits}
              onChange={handleChange}
            />
            {errors.credits && <span className="error">{errors.credits}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
