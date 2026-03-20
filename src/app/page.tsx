import { redirect } from 'next/navigation';

/**
 * HomePage: Automatically redirects to the Sign-In page 
 * to showcase the newly implemented login interface.
 */
export default function HomePage() {
  redirect('/auth/sign-in');
}
