
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Link,
  Image as ImageIcon,
  Eye,
  Code
} from "lucide-react";
import { uploadBlogImage } from "@/utils/blogImageUpload";
import { toast } from "sonner";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onPreview?: () => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onPreview,
}) => {
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertText = (beforeText: string, afterText: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newContent = 
      content.substring(0, start) + 
      beforeText + textToInsert + afterText + 
      content.substring(end);
    
    onChange(newContent);

    // Set cursor position
    setTimeout(() => {
      const newStart = start + beforeText.length;
      const newEnd = newStart + textToInsert.length;
      textarea.setSelectionRange(newStart, newEnd);
      textarea.focus();
    }, 0);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadBlogImage(file);
      if (imageUrl) {
        const altText = file.name.split('.')[0];
        insertText(`![${altText}](${imageUrl})`);
        toast.success("Obrázok bol úspešne vložený");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toolbarButtons = [
    {
      icon: Bold,
      label: "Tučné",
      action: () => insertText("**", "**", "tučný text")
    },
    {
      icon: Italic,
      label: "Kurzíva",
      action: () => insertText("_", "_", "kurzíva")
    },
    {
      icon: Code,
      label: "Kód",
      action: () => insertText("`", "`", "kód")
    },
    {
      icon: List,
      label: "Zoznam",
      action: () => insertText("\n- ", "", "položka zoznamu")
    },
    {
      icon: ListOrdered,
      label: "Číslovaný zoznam",
      action: () => insertText("\n1. ", "", "položka zoznamu")
    },
    {
      icon: Link,
      label: "Odkaz",
      action: () => insertText("[", "](https://)", "text odkazu")
    },
  ];

  return (
    <div className="space-y-4">
      <Label htmlFor="content">Obsah príspevku</Label>
      
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border rounded-t-md bg-gray-50">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            onClick={button.action}
            title={button.label}
            className="h-8 w-8 p-0"
          >
            <button.icon className="w-4 h-4" />
          </Button>
        ))}
        
        <div className="border-l mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Vložiť obrázok"
          className="h-8 w-8 p-0"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        
        {onPreview && (
          <>
            <div className="border-l mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onPreview}
              title="Náhľad"
              className="h-8 px-2"
            >
              <Eye className="w-4 h-4 mr-1" />
              Náhľad
            </Button>
          </>
        )}
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        id="content"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        rows={20}
        className="font-mono text-sm rounded-t-none"
        placeholder="Začnite písať váš príspevok..."
      />

      {/* Helper text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Podporované formátovanie Markdown:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span>**tučné** alebo __tučné__</span>
          <span>*kurzíva* alebo _kurzíva_</span>
          <span># Nadpis 1</span>
          <span>## Nadpis 2</span>
          <span>[odkaz](URL)</span>
          <span>`kód`</span>
        </div>
      </div>

      {uploading && (
        <div className="text-sm text-blue-600">
          Nahráva sa obrázok...
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default RichTextEditor;
