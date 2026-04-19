'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div style={{ display: 'flex', gap: '8px', padding: '10px 0', borderBottom: '1px solid var(--border)', marginBottom: '1rem', flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'btn-primary' : 'btn-secondary'}
        style={{ padding: '0.2rem 0.8rem', fontSize: '0.9rem' }}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'btn-primary' : 'btn-secondary'}
        style={{ padding: '0.2rem 0.8rem', fontSize: '0.9rem', fontStyle: 'italic' }}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'btn-primary' : 'btn-secondary'}
        style={{ padding: '0.2rem 0.8rem', fontSize: '0.9rem', textDecoration: 'line-through' }}
      >
        S
      </button>
      <div style={{ width: '1px', backgroundColor: 'var(--border)', margin: '0 5px' }} />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'btn-primary' : 'btn-secondary'}
        style={{ padding: '0.2rem 0.8rem', fontSize: '0.9rem' }}
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'btn-primary' : 'btn-secondary'}
        style={{ padding: '0.2rem 0.8rem', fontSize: '0.9rem' }}
      >
        " Quote
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="btn-secondary"
        style={{ padding: '0.2rem 0.8rem', fontSize: '0.9rem' }}
      >
        ---
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange }: { content: string, onChange: (content: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none tiptap-body',
            style: 'min-height: 300px; font-family: var(--font-inter); font-size: 1.1rem; line-height: 1.8;'
        }
    }
  });

  return (
    <div style={{ border: '1px solid transparent', display: 'flex', flexDirection: 'column' }}>
      <MenuBar editor={editor} />
      <div style={{
        minHeight: '300px',
        maxHeight: '50vh',
        overflowY: 'auto',
        padding: '1rem 0',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--border) transparent',
      }}>
        <EditorContent editor={editor} />
      </div>
      {/* Global styles for TipTap content rendering */}
      <style dangerouslySetInnerHTML={{__html: `
        .tiptap-body blockquote {
            border-left: 3px solid var(--accent);
            padding-left: 1rem;
            margin-left: 0;
            font-style: italic;
            color: var(--text-secondary);
        }
        .tiptap-body h3 {
            font-family: var(--font-heading);
            font-size: 1.5rem;
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
        }
        .tiptap-body hr {
            border: none;
            border-top: 1px dotted var(--border);
            margin: 2rem 0;
        }
        .tiptap-body p { margin-bottom: 0.8rem; }
        .tiptap-body p:last-child { margin-bottom: 0; }
      `}} />
    </div>
  );
}
