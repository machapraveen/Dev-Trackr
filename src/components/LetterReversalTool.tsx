
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export function LetterReversalTool() {
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [reversedText, setReversedText] = useState("");

  const reverseText = () => {
    const reversed = inputText.split('').reverse().join('');
    setReversedText(reversed);
    toast({
      title: "Text Reversed",
      description: "Your text has been reversed successfully!",
    });
  };

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Letter Reversal Tool</h2>
      <div className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder="Enter text to reverse"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="max-w-md"
        />
        <div className="flex gap-4 items-center">
          <Button onClick={reverseText} className="bg-primary">
            Reverse Text
          </Button>
          {reversedText && (
            <div className="p-4 bg-secondary rounded-md">
              <p className="font-mono">{reversedText}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
