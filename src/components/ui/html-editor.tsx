"use client"

import { useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code, 
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Type
} from "lucide-react"

interface HtmlEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function HtmlEditor({ value, onChange, placeholder = "Start writing here...", className = "" }: HtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }, [onChange])

  // Execute formatting commands
  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }, [handleInput])

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Handle image upload
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    try {
      const base64 = await convertToBase64(file)
      
      // Insert image into editor
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const img = document.createElement('img')
        img.src = base64
        img.style.maxWidth = '100%'
        img.style.height = 'auto'
        img.alt = file.name
        
        range.deleteContents()
        range.insertNode(img)
        
        // Move cursor after image
        range.setStartAfter(img)
        range.setEndAfter(img)
        selection.removeAllRanges()
        selection.addRange(range)
      } else {
        // If no selection, append to end
        if (editorRef.current) {
          const img = document.createElement('img')
          img.src = base64
          img.style.maxWidth = '100%'
          img.style.height = 'auto'
          img.alt = file.name
          editorRef.current.appendChild(img)
        }
      }
      
      handleInput()
      editorRef.current?.focus()
    } catch (error) {
      console.error('Error converting image to base64:', error)
      alert('Failed to upload image')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleInput])

  // Handle special commands
  const handleSpecialCommand = useCallback((type: string) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    switch (type) {
      case 'h1':
      case 'h2':
      case 'h3':
        executeCommand('formatBlock', type.toUpperCase())
        break
      case 'link':
        const url = prompt('Enter URL:')
        if (url) executeCommand('createLink', url)
        break
      case 'image':
        // Trigger file input
        fileInputRef.current?.click()
        break
      case 'code':
        executeCommand('formatBlock', 'PRE')
        break
      default:
        executeCommand(type)
    }
  }, [executeCommand])

  // Get character count
  const getCharacterCount = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent?.length || 0
  }

  // Toolbar configuration
  const toolbarGroups = [
    {
      items: [
        { icon: Heading1, command: 'h1', label: 'Heading 1' },
        { icon: Heading2, command: 'h2', label: 'Heading 2' },
        { icon: Heading3, command: 'h3', label: 'Heading 3' },
        { icon: Type, command: 'removeFormat', label: 'Normal Text' },
      ]
    },
    {
      items: [
        { icon: Bold, command: 'bold', label: 'Bold' },
        { icon: Italic, command: 'italic', label: 'Italic' },
        { icon: Underline, command: 'underline', label: 'Underline' },
        { icon: Strikethrough, command: 'strikeThrough', label: 'Strikethrough' },
      ]
    },
    {
      items: [
        { icon: List, command: 'insertUnorderedList', label: 'Bullet List' },
        { icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered List' },
      ]
    },
    {
      items: [
        { icon: AlignLeft, command: 'justifyLeft', label: 'Align Left' },
        { icon: AlignCenter, command: 'justifyCenter', label: 'Align Center' },
        { icon: AlignRight, command: 'justifyRight', label: 'Align Right' },
      ]
    },
    {
      items: [
        { icon: Quote, command: 'formatBlock', label: 'Quote', value: 'BLOCKQUOTE' },
        { icon: Code, command: 'code', label: 'Code Block' },
      ]
    },
    {
      items: [
        { icon: Link, command: 'link', label: 'Insert Link' },
        { icon: Image, command: 'image', label: 'Insert Image' },
      ]
    }
  ]

  return (
    <div className={`v-editor border border-gray-200 rounded-lg ${className}`} style={{ minHeight: '400px' }}>
      {/* Toolbar */}
      <div className="ql-toolbar ql-snow border-b border-gray-200 p-2 flex flex-wrap gap-1">
        {toolbarGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="ql-formats flex">
            {group.items.map((item, itemIndex) => (
              <Button
                key={itemIndex}
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100"
                onClick={() => handleSpecialCommand(item.command)}
                title={item.label}
              >
                <item.icon className="h-4 w-4" />
              </Button>
            ))}
            {groupIndex < toolbarGroups.length - 1 && (
              <Separator orientation="vertical" className="mx-1 h-6" />
            )}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="ql-container ql-snow">
        <div
          ref={editorRef}
          className="ql-editor"
          contentEditable
          onInput={handleInput}

          style={{
            minHeight: '300px',
            padding: '16px',
            lineHeight: '1.6',
            fontSize: '14px',
            outline: 'none'
          }}
          data-placeholder={!value ? placeholder : undefined}
          suppressContentEditableWarning={true}
        />
      </div>

      {/* Character Counter */}
      <div className="ql-counter text-xs text-muted-foreground mt-1 text-right pe-1 border-t border-gray-200 p-2 bg-gray-50">
        {getCharacterCount(value)} characters
      </div>

      {/* Hidden file input for image upload */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  )
} 