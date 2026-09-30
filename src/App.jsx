import { useEffect, useRef, useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'

const PRIORITY_LABEL = { low: 'ต่ำ', medium: 'กลาง', high: 'สูง' }
const ORDER = ['low', 'medium', 'high']
const FILTERS = [
  ['all', 'ทั้งหมด'],
  ['active', 'ยังไม่เสร็จ'],
  ['done', 'เสร็จแล้ว'],
]

let nextId = 4

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

        {editing ? (
          <input
            ref={inputRef}
            className="inp flex-1 py-1"
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
            className="flex-1 break-words min-w-0"
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
    { id: 1, text: 'ตัวอย่าง: ซื้อของเข้าบ้าน', done: false, priority: 'medium' },
    { id: 2, text: 'ส่งรายงานให้หัวหน้า', done: false, priority: 'high' },
    { id: 3, text: 'ดับเบิลคลิกข้อความเพื่อแก้ไข', done: true, priority: 'low' },
  ])
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')

  const add = () => {
    const v = text.trim()
    if (!v) return
    setTodos((a) => [{ id: nextId++, text: v, done: false, priority }, ...a])
    setText('')
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
  const shown = todos.filter(
    (t) => filter === 'all' || (filter === 'active' ? !t.done : t.done),
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-5">สิ่งที่ต้องทำ</h1>

      <div className="card p-3 mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          className="inp flex-1"
          placeholder="เพิ่มงานใหม่..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <div className="flex gap-2">
          <select
            className="inp flex-1 sm:flex-none"
            style={{ background: 'var(--card)' }}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {ORDER.map((k) => (
              <option key={k} value={k}>
                ความสำคัญ: {PRIORITY_LABEL[k]}
              </option>
            ))}
          </select>
          <button className="btn" onClick={add}>
            <Plus size={18} />
            เพิ่ม
          </button>
        </div>
      </div>

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
    </div>
  )
}
