import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export function Navigation({ signedIn }: { signedIn: boolean }) {
  return <nav className="navigation" aria-label="Main navigation">
    <Link className="brand" href="/">THE MOVIE SHELF</Link>
    <div className="nav-links">
      {signedIn ? <><Link href="/members">Members</Link><Link href="/profile">Profile</Link>
        <form action={signOut}><button className="text-button">Sign out</button></form></> : <Link href="/login">Sign in</Link>}
    </div>
  </nav>;
}
