import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export function Navigation({ signedIn }: { signedIn: boolean }) {
  return <nav className="navigation" aria-label="Main navigation">
    <Link className="brand" href="/">NYC, ACCORDING TO AI</Link>
    <div className="nav-links">
      {signedIn ? <><Link href="/create">Create</Link><Link href="/members">My captions</Link><Link href="/profile">Profile</Link>
        <form action={signOut}><button className="text-button">Sign out</button></form></> : <Link href="/login">Sign in</Link>}
    </div>
  </nav>;
}
