"use client";

import { useRef, useState, useEffect } from "react";
import ImageLibrary from "./ImageLibrary";
import styles from "./RichTextEditor.module.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your blog...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showImageLibrary, setShowImageLibrary] = useState(false);

  useEffect(() => {
    if (
      editorRef.current &&
      editorRef.current.innerHTML !== value
    ) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertImage = (url: string) => {
    if (!editorRef.current) return;
    
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.borderRadius = "8px";
    img.style.margin = "16px 0";
    img.style.display = "block";
    
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      // Insert at cursor position
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      // Insert a line break before image if needed
      const textNode = document.createTextNode("\n");
      range.insertNode(textNode);
      
      // Insert image after the line break
      range.setStartAfter(textNode);
      range.insertNode(img);
      
      // Insert a line break after image
      const textNodeAfter = document.createTextNode("\n");
      range.setStartAfter(img);
      range.insertNode(textNodeAfter);
      
      // Move cursor after the image
      range.setStartAfter(textNodeAfter);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // No selection, append to end
      editorRef.current.appendChild(img);
      
      // Create a text node after image for cursor placement
      const textNode = document.createTextNode("\n");
      editorRef.current.appendChild(textNode);
      
      // Set cursor after the text node
      const range = document.createRange();
      range.setStartAfter(textNode);
      range.collapse(true);
      const newSelection = window.getSelection();
      if (newSelection) {
        newSelection.removeAllRanges();
        newSelection.addRange(range);
      }
    }
    
    // Update content and maintain focus
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  };

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => execCommand("bold")}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => execCommand("italic")}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => execCommand("underline")}
          title="Underline"
        >
          <u>U</u>
        </button>
        <div className={styles.separator} />
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => execCommand("formatBlock", "h1")}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => execCommand("formatBlock", "h2")}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => execCommand("formatBlock", "h3")}
          title="Heading 3"
        >
          H3
        </button>
        <div className={styles.separator} />
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => execCommand("insertUnorderedList")}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => execCommand("insertOrderedList")}
          title="Numbered List"
        >
          1.
        </button>
        <div className={styles.separator} />
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => setShowImageLibrary(true)}
          title="Image Library"
        >
          🖼️ Library
        </button>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => {
            const url = prompt("Enter URL:");
            if (url) execCommand("createLink", url);
          }}
          title="Insert Link"
        >
          🔗
        </button>
      </div>
      <div
        ref={editorRef}
        className={styles.editorContent}
        contentEditable
        onInput={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(e) => {
          e.preventDefault();
          const url = e.dataTransfer.getData("text/plain");
          if (url && url.startsWith("http")) {
            insertImage(url);
          }
        }}
        data-placeholder={placeholder}
      />
      {showImageLibrary && (
        <ImageLibrary
          onImageSelect={(url) => {
            insertImage(url);
          }}
          onClose={() => setShowImageLibrary(false)}
        />
      )}
    </div>
  );
}
