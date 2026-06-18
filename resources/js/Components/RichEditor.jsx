import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import {
    Bold, Italic, Strikethrough, Code, List, ListOrdered,
    Heading2, Heading3, Quote, Minus, Undo, Redo, Code2,
} from 'lucide-react';

function ToolbarBtn({ onClick, active, title, children }) {
    return (
        <button
            type="button"
            onMouseDown={e => { e.preventDefault(); onClick(); }}
            title={title}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                background: active ? '#3b82f6' : 'transparent',
                color: active ? '#fff' : 'inherit',
                flexShrink: 0,
            }}
        >
            {children}
        </button>
    );
}

function Divider() {
    return (
        <span style={{ width: '1px', height: '20px', background: 'currentColor', opacity: 0.15, margin: '0 4px', flexShrink: 0 }} />
    );
}

export default function RichEditor({ value, onChange, placeholder }) {
    const [sourceMode, setSourceMode] = useState(false);
    const [sourceHtml, setSourceHtml] = useState(value || '');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
        ],
        content: value || '',
        editorProps: {
            attributes: { class: 'rich-editor-content' },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor || sourceMode) return;
        const current = editor.getHTML();
        if (value !== current) {
            editor.commands.setContent(value || '', false);
        }
    }, [value]);

    const toggleSource = () => {
        if (!sourceMode) {
            const html = editor ? editor.getHTML() : value || '';
            setSourceHtml(html);
            setSourceMode(true);
        } else {
            if (editor) {
                editor.commands.setContent(sourceHtml, false);
            }
            onChange(sourceHtml);
            setSourceMode(false);
        }
    };

    const handleSourceChange = (e) => {
        setSourceHtml(e.target.value);
        onChange(e.target.value);
    };

    if (!editor) return null;

    const cmd = editor.chain().focus();

    return (
        <div className="rich-editor-wrapper">
            {/* тулбар */}
            <div className="rich-editor-toolbar">
                {!sourceMode && <>
                    <ToolbarBtn onClick={() => cmd.toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={14} /></ToolbarBtn>
                    <ToolbarBtn onClick={() => cmd.toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={14} /></ToolbarBtn>
                    <ToolbarBtn onClick={() => cmd.toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={14} /></ToolbarBtn>
                    <ToolbarBtn onClick={() => cmd.toggleCode().run()} active={editor.isActive('code')} title="Inline code"><Code size={14} /></ToolbarBtn>
                    <Divider />
                    <ToolbarBtn onClick={() => cmd.toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={14} /></ToolbarBtn>
                    <ToolbarBtn onClick={() => cmd.toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={14} /></ToolbarBtn>
                    <Divider />
                    <ToolbarBtn onClick={() => cmd.toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><List size={14} /></ToolbarBtn>
                    <ToolbarBtn onClick={() => cmd.toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><ListOrdered size={14} /></ToolbarBtn>
                    <Divider />
                    <ToolbarBtn onClick={() => cmd.toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={14} /></ToolbarBtn>
                    <ToolbarBtn onClick={() => cmd.setHorizontalRule().run()} active={false} title="Horizontal rule"><Minus size={14} /></ToolbarBtn>
                    <Divider />
                    <ToolbarBtn onClick={() => cmd.undo().run()} active={false} title="Undo"><Undo size={14} /></ToolbarBtn>
                    <ToolbarBtn onClick={() => cmd.redo().run()} active={false} title="Redo"><Redo size={14} /></ToolbarBtn>
                    <Divider />
                </>}

                <span style={{ marginLeft: 'auto' }}>
                    <ToolbarBtn onClick={toggleSource} active={sourceMode} title={sourceMode ? 'Режим візуального редагування' : 'Редагування HTML коду'}>
                        <Code2 size={14} />
                    </ToolbarBtn>
                </span>
            </div>

            {/* візуальний редактор */}
            <div style={{ display: sourceMode ? 'none' : 'block' }}>
                <EditorContent editor={editor} />
            </div>

            {/* редактор html коду */}
            {sourceMode && (
                <textarea
                    className="rich-editor-source"
                    value={sourceHtml}
                    onChange={handleSourceChange}
                    spellCheck={false}
                />
            )}
        </div>
    );
}
