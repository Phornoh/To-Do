import { useEffect, useRef, useState } from 'react'
import { Calendar, Check, Plus, Search, Trash2 } from 'lucide-react'

const PRIORITY_LABEL = { low: 'ต่ำ', medium: 'กลาง', high: 'สูง' }
const ORDER = ['low', 'medium', 'high']
const FILTERS = [
  ['all', 'ทั้งหมด'],
  ['active', 'ยังไม่เสร็จ'],
  ['done', 'เสร็จแล้ว'],
]

const CATEGORIES = {
  work: { label: 'งาน', color: '#3b82f6' },
  personal: { label: 'ส่วนตัว', color: '#a855f7' },
  shopping: { label: 'ช้อปปิ้ง', color: '#f97316' },
  health: { label: 'สุขภาพ', color: '#14b8a6' },
}

const iso = (d) => d.toLocaleDateString('sv-SE')
const today = () => iso(new Date())
const addDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return iso(d)
}
const fmtDate = (s) =>
  new Date(s + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
const isOverdue = (t) => !t.done && t.due && t.due < today()

let nextId = 6

function TodoItem({ todo, onToggle, onDelete, onEdit, onPriority }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(todo.text)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const save = () => {
    const v = value.trim()
    if (v) onEdit(todo.id, v)
    else setValue(todo.text)
    setEditing(false)
  }

  return (
    <div className={`item${todo.removing ? ' out' : ''}`} style={{ marginBottom: '.6rem' }}>
      <div className="card flex items-center gap-3 px-3 py-3">
        <button
          className={`chk${todo.done ? ' on' : ''}`}
          onClick={() => onToggle(todo.id)}
          aria-label="เสร็จแล้ว"
        >
          {todo.done && <Check size={14} strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              className="inp w-full py-1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save()
                if (e.key === 'Escape') {
                  setValue(todo.text)
                  setEditing(false)
                }
              }}
            />
          ) : (
            <span
              className="block break-words"
              style={{
                textDecoration: todo.done ? 'line-through' : 'none',
                color: todo.done ? 'var(--muted)' : 'var(--text)',
              }}
              onDoubleClick={() => {
                setValue(todo.text)
                setEditing(true)
              }}
              title="ดับเบิลคลิกเพื่อแก้ไข"
            >
              {todo.text}
            </span>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="tag">
              <span className="dot" style={{ background: CATEGORIES[todo.category].color }} />
              {CATEGORIES[todo.category].label}
            </span>
            {todo.due && (
              <span
                className={`due${
                  isOverdue(todo) ? ' over' : todo.due === today() && !todo.done ? ' today' : ''
                }`}
              >
                {isOverdue(todo) ? 'เลยกำหนด · ' : todo.due === today() && !todo.done ? 'วันนี้ · ' : ''}
                {fmtDate(todo.due)}
              </span>
            )}
          </div>
        </div>

        <button
          className={`badge p-${todo.priority}`}
          onClick={() => onPriority(todo.id)}
          title="คลิกเพื่อเปลี่ยนความสำคัญ"
        >
          {PRIORITY_LABEL[todo.priority]}
        </button>

        <button className="ico" onClick={() => onDelete(todo.id)} aria-label="ลบ">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'ส่งรายงานให้หัวหน้า', done: false, priority: 'high', category: 'work', due: addDays(-1) },
    { id: 2, text: 'ประชุมทีมประจำสัปดาห์', done: false, priority: 'medium', category: 'work', due: today() },
    { id: 3, text: 'ซื้อของเข้าบ้าน', done: false, priority: 'low', category: 'shopping', due: addDays(2) },
    { id: 4, text: 'นัดตรวจสุขภาพประจำปี', done: false, priority: 'medium', category: 'health', due: addDays(7) },
    { id: 5, text: 'โทรหาที่บ้าน', done: true, priority: 'low', category: 'personal', due: '' },
  ])
  const [category, setCategory] = useState('work')
  const [due, setDue] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')

  const add = () => {
    const v = text.trim()
    if (!v) return
    setTodos((a) => [{ id: nextId++, text: v, done: false, priority, category, due }, ...a])
    setText('')
    setDue('')
  }
  const toggle = (id) => setTodos((a) => a.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const edit = (id, v) => setTodos((a) => a.map((t) => (t.id === id ? { ...t, text: v } : t)))
  const cyclePriority = (id) =>
    setTodos((a) =>
      a.map((t) =>
        t.id === id ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % ORDER.length] } : t,
      ),
    )
  const remove = (id) => {
    setTodos((a) => a.map((t) => (t.id === id ? { ...t, removing: true } : t)))
    setTimeout(() => setTodos((a) => a.filter((t) => t.id !== id)), 260)
  }
  const clearCompleted = () => {
    setTodos((a) => a.map((t) => (t.done ? { ...t, removing: true } : t)))
    setTimeout(() => setTodos((a) => a.filter((t) => !t.done)), 260)
  }

  const remaining = todos.filter((t) => !t.done).length
  const doneCount = todos.length - remaining
  const q = query.trim().toLowerCase()
  const shown = todos.filter(
    (t) =>
      (filter === 'all' || (filter === 'active' ? !t.done : t.done)) &&
      (catFilter === 'all' || t.category === catFilter) &&
      (!q || t.text.toLowerCase().includes(q)),
  )
  const overdueCount = todos.filter(isOverdue).length
  const activeOk = remaining - overdueCount
  const pct = todos.length ? Math.round((doneCount / todos.length) * 100) : 0
  const segments = [
    { label: 'เสร็จแล้ว', n: doneCount, color: '#22c55e' },
    { label: 'ยังไม่เสร็จ', n: activeOk, color: 'var(--accent)' },
    { label: 'เลยกำหนด', n: overdueCount, color: '#ef4444' },
  ]
  let offset = 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-5">สิ่งที่ต้องทำ</h1>

      <div className="card p-4 mb-4 flex items-center gap-5">
        <svg width="84" height="84" viewBox="0 0 36 36" style={{ flex: 'none' }}>
          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--line)" strokeWidth="4" />
          {todos.length > 0 &&
            segments.map((sg) => {
              const len = (sg.n / todos.length) * 100
              const el = (
                <circle
                  key={sg.label}
                  cx="18" cy="18" r="15.9155" fill="none"
                  stroke={sg.color} strokeWidth="4"
                  strokeDasharray={`${len} ${100 - len}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 18 18)"
                />
              )
              offset += len
              return sg.n ? el : null
            })}
          <text x="18" y="20.5" textAnchor="middle" fontSize="7" fontWeight="600" fill="var(--text)">
            {pct}%
          </text>
        </svg>
        <div className="flex-1 min-w-0">
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            ทั้งหมด <b style={{ color: 'var(--text)' }}>{todos.length}</b> งาน · เสร็จแล้ว{' '}
            <b style={{ color: 'var(--text)' }}>{pct}%</b>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {segments.map((sg) => (
              <span key={sg.label} className="tag">
                <span className="dot" style={{ background: sg.color }} />
                {sg.label} {sg.n}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="md:flex md:gap-6 md:items-start">
        <aside className="md:w-52 md:flex-none mb-4">
          <div className="card p-2 flex md:flex-col gap-1 overflow-x-auto">
            <button className={`side-btn${catFilter === 'all' ? ' on' : ''}`} onClick={() => setCatFilter('all')}>
              <span>ทุกหมวด</span>
              <span className="cnt">{todos.length}</span>
            </button>
            {Object.entries(CATEGORIES).map(([k, c]) => (
              <button key={k} className={`side-btn${catFilter === k ? ' on' : ''}`} onClick={() => setCatFilter(k)}>
                <span className="flex items-center gap-2">
                  <span className="dot" style={{ background: c.color }} />
                  {c.label}
                </span>
                <span className="cnt">{todos.filter((t) => t.category === k).length}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 min-w-0">
      <div className="card p-3 mb-4 flex flex-col gap-2">
        <input
          className="inp"
          placeholder="เพิ่มงานใหม่..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <div className="flex flex-wrap gap-2">
          <select className="inp" style={{ background: 'var(--card)' }} value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.entries(CATEGORIES).map(([k, c]) => (
              <option key={k} value={k}>{c.label}</option>
            ))}
          </select>
          <select className="inp" style={{ background: 'var(--card)' }} value={priority} onChange={(e) => setPriority(e.target.value)}>
            {ORDER.map((k) => (
              <option key={k} value={k}>ความสำคัญ: {PRIORITY_LABEL[k]}</option>
            ))}
          </select>
          <label className="inp flex items-center gap-2">
            <Calendar size={16} style={{ color: 'var(--muted)' }} />
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
              style={{ background: 'transparent', color: 'var(--text)', outline: 'none', colorScheme: 'light dark' }} />
          </label>
          <button className="btn ml-auto" onClick={add}>
            <Plus size={18} />
            เพิ่ม
          </button>
        </div>
      </div>

      <label className="inp flex items-center gap-2 mb-4" style={{ background: 'var(--card)' }}>
        <Search size={16} style={{ color: 'var(--muted)' }} />
        <input className="flex-1 min-w-0" placeholder="ค้นหางาน..." value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ background: 'transparent', color: 'var(--text)', outline: 'none' }} />
      </label>

      <div className="flex gap-1 mb-4 overflow-x-auto">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            className={`tab${filter === key ? ' on' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        {shown.length === 0 ? (
          <div className="card p-6 text-center" style={{ color: 'var(--muted)' }}>
            ไม่มีรายการ
          </div>
        ) : (
          shown.map((t) => (
            <TodoItem
              key={t.id}
              todo={t}
              onToggle={toggle}
              onDelete={remove}
              onEdit={edit}
              onPriority={cyclePriority}
            />
          ))
        )}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm" style={{ color: 'var(--muted)' }}>
        <span>เหลืออีก {remaining} งาน</span>
        <button
          className="ico"
          style={{ opacity: doneCount ? 1 : 0.4, fontSize: '.875rem' }}
          disabled={!doneCount}
          onClick={clearCompleted}
        >
          ล้างที่เสร็จแล้ว ({doneCount})
        </button>
      </div>
        </main>
      </div>
    </div>
  )
}
