import { useEffect, useState, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-markup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface Props {
  code: string;
  title?: string;
  language?: string;
  typingSpeed?: number;
}

export default function CodeDisplay({ 
  code, 
  title = "Generated Code",
  language = "html",
  typingSpeed = 25 
}: Props) {
  const [displayedCode, setDisplayedCode] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    let currentChar = 0;
    const typeChar = () => {
      if (currentChar < code.length) {
        setDisplayedCode(code.slice(0, currentChar + 1));
        currentChar++;
        setTimeout(typeChar, typingSpeed);
      } else {
        setIsTyping(false);
      }
    };

    typeChar();
  }, [code, typingSpeed]);

  useEffect(() => {
    if (preRef.current && !isTyping) {
      Prism.highlightElement(preRef.current);
    }
  }, [displayedCode, isTyping]);

  const handlePreview = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(code);
      newWindow.document.close();
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          disabled={isTyping}
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview Banner
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <pre
            ref={preRef}
            className="rounded-lg bg-slate-950 p-4 overflow-x-auto"
          >
            <code className={`language-${language}`}>
              {displayedCode}
            </code>
          </pre>
          {isTyping && (
            <span className="absolute bottom-4 right-4 animate-pulse text-primary">
              ▋
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
