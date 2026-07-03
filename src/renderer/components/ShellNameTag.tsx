import React, { useState, useRef, useEffect } from 'react'

interface ShellNameTagProps {
  name: string
  onRename: (name: string) => void
}

const ShellNameTag: React.FC<ShellNameTagProps> = ({ name, onRename }) => {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  useEffect(() => {
    setValue(name)
  }, [name])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed && trimmed !== name) {
      onRename(trimmed)
    } else {
      setValue(name)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="shell-name-input"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, 24))}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit()
          if (e.key === 'Escape') { setValue(name); setEditing(false) }
        }}
        maxLength={24}
        spellCheck={false}
      />
    )
  }

  return (
    <span
      className="shell-name-display"
      onDoubleClick={() => setEditing(true)}
      title="Double-click to rename"
    >
      {name}
    </span>
  )
}

export default ShellNameTag
