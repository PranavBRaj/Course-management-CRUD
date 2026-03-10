// LoginPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [isLogin, setIsLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'student',
  })
  const [errors, setErrors] = useState({})
  
  const [weekDates, setWeekDates] = useState([])

  useEffect(() => {
    const curr = new Date();
    const currentDayOfWeek = curr.getDay();
    const firstDayOfWeek = curr.getDate() - currentDayOfWeek; 
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const week = [];
    
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(curr.getTime());
      nextDate.setDate(firstDayOfWeek + i);
      
      week.push({
        dayName: days[i],
        date: nextDate.getDate(),
        isToday: nextDate.getDate() === curr.getDate() && nextDate.getMonth() === curr.getMonth(),
        isHoliday: i === 0
      });
    }
    setWeekDates(week);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  function validate() {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Username is required'
    if (!isLogin && !form.email.trim()) errs.email = 'Email is required'
    if (!isLogin && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address'
    if (!form.password || form.password.length < 6)
      errs.password = 'Password must be at least 6 characters'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      if (isLogin) {
        const user = await login(form.username, form.password)
        toast.success(`Welcome back, ${user.username}!`)
        navigate(user.role === 'teacher' ? '/teacher' : '/student')
      } else {
        await register(form.username, form.email, form.password, form.role)
        toast.success('Account created! Please log in.')
        setIsLogin(true)
        setForm({ username: '', email: '', password: '', role: 'student' })
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-split-card">
        
        {/* Left Form Section */}
        <div className="auth-left">
          <div className="auth-logo">Nous Tech</div>

          <div className="auth-header">
            <h2>{isLogin ? 'Welcome back' : 'Create an account'}</h2>
            <p>{isLogin ? 'Enter your details to sign in' : 'Sign up and get started today'}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                placeholder="e.g. johndoe"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
              {errors.username && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', paddingLeft: '0.5rem' }}>{errors.username}</span>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', paddingLeft: '0.5rem' }}>{errors.email}</span>}
              </div>
            )}

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <span style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9ca3af' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </span>
              </div>
              {errors.password && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', paddingLeft: '0.5rem' }}>{errors.password}</span>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>I am a...</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            )}

            <button type="submit" className="btn-yellow" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Submit'}
            </button>
          </form>

          <div className="auth-footer">
            <div>
              {isLogin ? "Don't have an account? " : "Have any account? "}
              <button onClick={() => { setIsLogin(!isLogin); setErrors({}); setForm({ username: '', email: '', password: '', role: 'student' }) }}>
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>

            <a href='https://www.nousinfosystems.com/' target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer', textDecoration: 'underline' }}>Terms & Conditions</a>
          </div>
        </div>

        {/* Right Image Section */}
        <div className="auth-right">
          
          {/* Made this a clickable link to open Teams */}
          <a 
            href="https://teams.microsoft.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="glass-card glass-1"
            style={{ display: 'block', textDecoration: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>Task Review With Team</p>
            <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>09:30am - 10:00am</p>
          </a>
          
          <div className="glass-card glass-2">
            
            {/* Calendar Days Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 0.25rem' }}>
              {weekDates.map((dayObj, idx) => (
                <span 
                  key={`day-${idx}`} 
                  style={{ 
                    fontSize: '0.75rem', 
                    color: dayObj.isHoliday ? '#fca5a5' : '#ffffff',
                    opacity: dayObj.isToday ? 1 : 0.8,
                    fontWeight: dayObj.isToday ? 'bold' : 'normal'
                  }}
                >
                  {dayObj.dayName}
                </span>
              ))}
            </div>

            {/* Calendar Dates Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              {weekDates.map((dayObj, idx) => (
                <span 
                  key={`date-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: dayObj.isToday ? '#fcd34d' : 'transparent',
                    color: dayObj.isToday ? '#1c1917' : (dayObj.isHoliday ? '#fca5a5' : '#ffffff'),
                    fontSize: '0.9rem'
                  }}
                >
                  {dayObj.date}
                </span>
              ))}
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  )
}