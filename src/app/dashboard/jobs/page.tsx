
import { Suspense } from 'react';
import { suggestRelevantJobs } from '@/ai/flows/suggest-relevant-jobs';
import JobSuggestions from './JobSuggestions';
import { auth } from 'firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { Loader2 } from 'lucide-react';
import type { SuggestRelevantJobsOutput } from '@/ai/flows/suggest-relevant-jobs';
import { JobMatchingForm } from './JobMatchingForm';
import { getFirebaseAdminApp } from '@/firebase/admin';

async function SuggestionsLoader({ profileData }: { profileData: string }) {
  if (!profileData) {
    return null;
  }
  
  let suggestions: SuggestRelevantJobsOutput | null = null;
  let error = null;

  try {
    suggestions = await suggestRelevantJobs({ profileData });
    if (!suggestions) throw new Error('No suggestions returned from AI flow');

    // Attempt optional background save to user history if session cookie exists
    try {
      const sessionCookie = cookies().get('session')?.value;
      if (sessionCookie) {
        const adminApp = getFirebaseAdminApp();
        const decodedToken = await auth(adminApp).verifySessionCookie(sessionCookie);
        const db = getFirestore(adminApp);

        const suggestedJobsCol = db
          .collection('users')
          .doc(decodedToken.uid)
          .collection('suggestedJobs');
        
        const batch = db.batch();

        if (suggestions.jobRoles) {
          for (const job of suggestions.jobRoles) {
            const newJobRef = suggestedJobsCol.doc();
            batch.set(newJobRef, {
              ...job,
              userId: decodedToken.uid,
              createdAt: FieldValue.serverTimestamp(),
            });
          }
          await batch.commit();
        }
      }
    } catch (saveError) {
      // Non-blocking: job suggestions still display even if server history save fails
      console.warn('Could not save job suggestions to server history:', saveError);
    }
  } catch (e) {
    console.error('Failed to get job suggestions:', e);
    error = 'Could not generate job suggestions. Please try again.';
  }

  if (error) {
    return (
      <p className="mt-8 text-center text-muted-foreground">
        {error}
      </p>
    );
  }

  if (!suggestions) {
    return null;
  }

  return <JobSuggestions suggestions={suggestions} />;
}

export default async function JobMatchingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const profile = (searchParams?.profile as string) || '';

  return (
    <div className="w-full">
      <h1 className="text-3xl font-headline font-bold mb-4">AI Job Matching</h1>
      <p className="text-muted-foreground mb-6">
        Paste your professional summary, LinkedIn profile, or project details
        below. Our AI will analyze your profile and suggest tailored job roles.
      </p>
      
      <JobMatchingForm profile={profile} />

      <Suspense fallback={
        <div className="flex items-center justify-center mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">
            Generating job suggestions...
            </p>
        </div>
      }>
        <SuggestionsLoader profileData={profile} />
      </Suspense>
    </div>
  );
}
