import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-black/50 mt-16">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <p className="text-base font-black uppercase tracking-tight mb-4">
              <span className="text-primary">NAUGHTY</span>
              <span className="ml-1">NETWORK</span>
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Premium episodic content. <br />
              Stream anywhere, anytime.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Browse
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#/series"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Series
                </a>
              </li>
              <li>
                <a
                  href="#/my-list"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  My List
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Account
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#/profile"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Profile
                </a>
              </li>
              <li>
                <a
                  href="#/my-list"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Watchlist
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-muted-foreground">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Terms of Use
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Cookie Preferences
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>\u00a9 {year} Naughty Network. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
