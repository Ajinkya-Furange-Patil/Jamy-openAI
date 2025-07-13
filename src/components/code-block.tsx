'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      toast({ title: 'Success', description: 'Code copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy code.',
      });
    }
  };

  return (
    <div className="relative group my-2">
      <div className="absolute top-2 right-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.375rem',
          backgroundColor: 'hsl(var(--secondary))',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-code)',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
