'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { useCollection, type WithId } from '@/firebase/firestore/use-collection';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateNoteSummary } from '@/ai/flows/generate-note-summary';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Mic,
  MicOff,
  Loader2,
  Save,
  NotebookPen,
  ChevronDown,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface Note {
  userId: string;
  title: string;
  content: string;
  summary: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function NotesPage() {
  const [transcribedText, setTranscribedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const currentUid = user?.uid || auth.currentUser?.uid;

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event: any) => {
      toast({
        title: 'Speech recognition error',
        description: event.error,
        variant: 'destructive',
      });
    };

    let finalTranscript = '';
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscribedText(finalTranscript + interimTranscript);
    };

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [toast]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Speech Recognition Not Supported',
        description: 'Your browser does not support microphone input. You can type notes directly.',
        variant: 'destructive',
      });
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSaveNote = async () => {
    if (!transcribedText.trim()) {
      toast({
        title: 'Note is empty',
        description: 'Please record something before saving.',
        variant: 'destructive',
      });
      return;
    }
    if (!auth.currentUser) {
      toast({ title: 'Not Authenticated', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const { title, summary } = await generateNoteSummary({
        content: transcribedText,
      });

      if (!currentUid) {
        toast({
          title: 'Not signed in',
          description: 'Please sign in to save your notes.',
          variant: 'destructive',
        });
        return;
      }

      const notesCol = collection(
        firestore,
        'users',
        currentUid,
        'notes'
      );
      addDocumentNonBlocking(notesCol, {
        userId: currentUid,
        title,
        content: transcribedText,
        summary,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Note Saved!',
        description: 'Your note and its AI summary have been saved.',
      });
      setTranscribedText('');
    } catch (error) {
       toast({
        title: 'Error Generating Summary',
        description: 'Could not generate summary for the note. The note was not saved.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const notesQuery = useMemoFirebase(() => {
    if (!currentUid) return null;
    return query(
      collection(firestore, 'users', currentUid, 'notes'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [currentUid, firestore]);

  const { data: notes, isLoading: isLoadingNotes } = useCollection<Note>(notesQuery);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-headline font-bold mb-4 flex items-center gap-2">
        <NotebookPen className="w-8 h-8" />
        Real-time Notes Generator
      </h1>
      <p className="text-muted-foreground mb-6">
        Click the microphone to start speaking. The AI will transcribe your
        voice in real-time. When you're done, save the note to get an AI-powered summary.
      </p>

      <Card className="glass-card">
        <CardContent className="pt-6">
          <Textarea
            placeholder="Your transcribed notes will appear here..."
            className="min-h-[200px] bg-background/80"
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={toggleRecording}
            variant={isRecording ? 'destructive' : 'outline'}
            size="icon"
          >
            {isRecording ? <MicOff /> : <Mic />}
          </Button>
          <Button onClick={handleSaveNote} disabled={isLoading || !transcribedText.trim()}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Note
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-12">
        <h2 className="text-2xl font-headline font-bold mb-4">Past Notes</h2>
        {isLoadingNotes ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !notes || notes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                You haven't saved any notes yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4">
              <Accordion type="single" collapsible>
                {notes.map((note: WithId<Note>) => (
                  <AccordionItem key={note.id} value={note.id}>
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex flex-col text-left">
                            <span className="font-semibold">{note.title}</span>
                            <span className="text-xs text-muted-foreground">
                                {note.createdAt?.seconds
                                ? formatDistanceToNow(
                                    new Date(note.createdAt.seconds * 1000),
                                    { addSuffix: true }
                                    )
                                : 'just now'}
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">AI Summary</h4>
                          <p className="text-sm text-muted-foreground italic">"{note.summary}"</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Full Transcription</h4>
                           <ScrollArea className="h-32 p-3 border rounded-md bg-muted/50">
                             <p className="text-sm text-muted-foreground">{note.content}</p>
                           </ScrollArea>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
