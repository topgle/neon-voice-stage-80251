import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Delete, Space } from "lucide-react";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onSpace: () => void;
  onClose: () => void;
}

const keyboardLayout = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

const numbersRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export const VirtualKeyboard = ({ onKeyPress, onDelete, onSpace, onClose }: VirtualKeyboardProps) => {
  const [isUpperCase, setIsUpperCase] = useState(false);

  const handleKeyPress = (key: string) => {
    const finalKey = isUpperCase ? key.toUpperCase() : key;
    onKeyPress(finalKey);
  };

  return (
    <Card className="fixed bottom-20 left-0 right-0 z-50 p-4 bg-card/95 backdrop-blur-lg border-t border-border md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:max-w-3xl">
      <div className="space-y-2">
        {/* Numbers row */}
        <div className="flex gap-1 justify-center mb-2">
          {numbersRow.map((key) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => onKeyPress(key)}
              className="h-10 min-w-[2.5rem] text-base font-semibold"
            >
              {key}
            </Button>
          ))}
        </div>

        {/* Letter rows */}
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((key) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => handleKeyPress(key)}
                className="h-12 min-w-[2.5rem] text-base font-semibold"
              >
                {isUpperCase ? key.toUpperCase() : key}
              </Button>
            ))}
          </div>
        ))}

        {/* Bottom row with controls */}
        <div className="flex gap-1 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUpperCase(!isUpperCase)}
            className="h-12 px-4"
          >
            {isUpperCase ? '⬆️ ABC' : '⬇️ abc'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSpace}
            className="h-12 flex-1 max-w-[200px]"
          >
            <Space className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="h-12 px-4"
          >
            <Delete className="h-5 w-5" />
          </Button>

          <Button
            variant="neon"
            size="sm"
            onClick={onClose}
            className="h-12 px-6"
          >
            Fechar
          </Button>
        </div>
      </div>
    </Card>
  );
};
