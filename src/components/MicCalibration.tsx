import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, Volume2, Loader2 } from 'lucide-react';
import { AudioAnalyzer } from '@/utils/audioAnalysis';

interface MicCalibrationProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function MicCalibration({ onComplete, onCancel }: MicCalibrationProps = {}) {
  const [step, setStep] = useState<'permission' | 'volume' | 'latency' | 'complete'>('permission');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [analyzer, setAnalyzer] = useState<AudioAnalyzer | null>(null);

  useEffect(() => {
    return () => {
      if (analyzer) {
        analyzer.stop();
      }
    };
  }, [analyzer]);

  const startCalibration = async () => {
    try {
      setIsCalibrating(true);
      const newAnalyzer = new AudioAnalyzer();
      await newAnalyzer.initialize();
      setAnalyzer(newAnalyzer);
      setStep('volume');
      setIsCalibrating(false);

      // Start monitoring volume
      newAnalyzer.startAnalysis((result) => {
        setVolumeLevel(result.volume * 100);
      });

      // Auto-advance after detecting good volume
      setTimeout(() => {
        if (volumeLevel > 10) {
          setStep('latency');
          setTimeout(() => {
            setStep('complete');
          }, 1500);
        } else {
          setStep('latency');
          setTimeout(() => {
            setStep('complete');
          }, 1500);
        }
      }, 3000);

    } catch (error) {
      console.error('Calibration failed:', error);
      setIsCalibrating(false);
    }
  };

  const handleComplete = () => {
    if (analyzer) {
      analyzer.stop();
    }
    onComplete?.();
  };

  return (
    <Card className="p-6 space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Calibração de Microfone</h2>
        <p className="text-muted-foreground">
          Vamos configurar seu microfone para a melhor experiência
        </p>
      </div>

      {step === 'permission' && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Mic className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-center">
              Precisamos de permissão para acessar seu microfone
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Isso nos permitirá analisar sua voz em tempo real
            </p>
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="outline" className="flex-1" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button 
              className="flex-1" 
              onClick={startCalibration}
              disabled={isCalibrating}
            >
              {isCalibrating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aguarde...
                </>
              ) : (
                'Permitir Acesso'
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'volume' && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Volume2 className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-center font-semibold">
              Teste seu volume
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Fale ou cante algo para testar o nível do microfone
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Nível</span>
              <span>{Math.round(volumeLevel)}%</span>
            </div>
            <Progress value={volumeLevel} className="h-3" />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {volumeLevel < 10 && "Fale mais alto..."}
            {volumeLevel >= 10 && volumeLevel < 50 && "Bom! Continue..."}
            {volumeLevel >= 50 && "Perfeito! ✓"}
          </p>
        </div>
      )}

      {step === 'latency' && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <Loader2 className="w-20 h-20 text-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-center font-semibold">
              Detectando latência...
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Calculando o delay do sistema
            </p>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <div className="text-4xl">✓</div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-center font-semibold text-green-600">
              Calibração Completa!
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Seu microfone está pronto para uso
            </p>
          </div>
          {onComplete && (
            <Button className="w-full" onClick={handleComplete}>
              Começar a Cantar
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
