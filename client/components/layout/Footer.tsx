export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-6 py-8 md:h-24 md:flex-row">
        <div className="space-y-1 text-center md:text-left">
          <div className="text-lg font-bold">Crownlinks Academy</div>
          <div className="text-sm text-muted-foreground">
            Professional courses for global teams
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Support
            </a>
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground">
            © {new Date().getFullYear()} Crownlinks Academy. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
