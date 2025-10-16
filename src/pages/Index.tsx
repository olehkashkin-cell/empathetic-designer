import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import VoiceOrb from '@/components/VoiceOrb';
import { AudioRecorder } from '@/utils/audioRecorder';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mic, Trash2, X } from 'lucide-react';

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('Готов к общению');
  const [isActive, setIsActive] = useState(false);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleVoiceClick = async () => {
    if (isActive) {
      // Остановить весь диалог
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (recorderRef.current) {
        recorderRef.current.stop();
      }
      setIsActive(false);
      setIsListening(false);
      setIsSpeaking(false);
      setStatusText('Готов к общению');
    } else {
      // Начать диалог
      setIsActive(true);
      await startListening();
    }
  };

  const startListening = async () => {
    try {
      setStatusText('Слушаю...');
      setIsListening(true);
      
      recorderRef.current = new AudioRecorder();
      await recorderRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить доступ к микрофону',
        variant: 'destructive',
      });
      setIsListening(false);
      setStatusText('Готов к общению');
    }
  };

  const stopListening = async () => {
    if (!recorderRef.current) return;

    try {
      setStatusText('Обрабатываю...');
      const audioBase64 = await recorderRef.current.stop();
      setIsListening(false);

      // Speech to text
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke(
        'speech-to-text',
        { body: { audio: audioBase64 } }
      );

      if (transcriptionError) throw transcriptionError;

      const userText = transcriptionData.text;
      console.log('User said:', userText);
      setStatusText('Думаю...');

      // Get GPT response
      const { data: chatData, error: chatError } = await supabase.functions.invoke(
        'chat-gpt',
        { body: { message: userText } }
      );

      if (chatError) throw chatError;

      const gptReply = chatData.reply;
      console.log('GPT replied:', gptReply);
      setStatusText('Говорю...');

      // Convert to speech
      const { data: speechData, error: speechError } = await supabase.functions.invoke(
        'text-to-speech',
        { body: { text: gptReply } }
      );

      if (speechError) throw speechError;

      // Play audio
      const audioBlob = base64ToBlob(speechData.audioContent, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current && isActive) {
        audioRef.current.src = audioUrl;
        setIsSpeaking(true);
        await audioRef.current.play();
      } else {
        setStatusText('Готов к общению');
      }
    } catch (error) {
      console.error('Error processing voice:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обработать запрос',
        variant: 'destructive',
      });
      if (isActive) {
        // При ошибке продолжить слушать
        await startListening();
      } else {
        setStatusText('Готов к общению');
      }
    }
  };

  // Функция для прерывания AI во время речи
  const interruptSpeech = async () => {
    if (isSpeaking && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
      if (isActive) {
        await startListening();
      }
    }
  };


  const base64ToBlob = (base64: string, type: string): Blob => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type });
  };

  const handleAudioEnded = async () => {
    setIsSpeaking(false);
    if (isActive) {
      // Автоматически начать слушать снова
      await startListening();
    } else {
      setStatusText('Готов к общению');
    }
  };

  const handleClearCache = () => {
    toast({
      title: 'Кэш очищен',
      description: 'История разговора удалена',
    });
  };

  const handleExit = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded}
        className="hidden"
      />
      
      <div 
        className="flex-1 flex items-center justify-center cursor-pointer"
        onClick={isSpeaking ? interruptSpeech : undefined}
      >
        <VoiceOrb isListening={isListening} isSpeaking={isSpeaking} />
      </div>

      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 text-accent text-xl font-light">
          <Mic className="w-5 h-5" />
          <span>{statusText}</span>
        </div>
      </div>

      <div className="w-full max-w-2xl flex justify-between gap-4 pb-8">
        <Button
          variant="outline"
          size="lg"
          onClick={handleClearCache}
          className="flex-1 bg-secondary/50 border-accent/30 text-accent hover:bg-secondary hover:border-accent/50 rounded-2xl"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Очистить кэш
        </Button>

        <Button
          size="lg"
          onClick={handleVoiceClick}
          className="flex-1 bg-accent text-background hover:bg-accent/90 rounded-2xl shadow-[0_0_20px_rgba(0,191,255,0.5)]"
        >
          <Mic className="mr-2 h-5 w-5" />
          {isActive ? 'Остановить диалог' : 'Начать диалог'}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleExit}
          className="flex-1 bg-destructive/20 border-destructive/30 text-destructive hover:bg-destructive/30 hover:border-destructive/50 rounded-2xl"
        >
          <X className="mr-2 h-5 w-5" />
          Выход
        </Button>
      </div>
    </div>
  );
};

export default Index;
