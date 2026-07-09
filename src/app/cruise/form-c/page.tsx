import { redirect } from 'next/navigation';

// The cruise sign-up form is embedded directly on /cruise — no separate page needed.
export default function FormC() {
  redirect('/cruise');
}
