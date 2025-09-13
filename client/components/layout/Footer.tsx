export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-6 py-8 md:h-24 md:flex-row">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F63a3c6fc0a3f4008855a3fca5a15d24a%2Fc74c4ca8ca5d4011ae8b79c2e033472e?format=webp&width=800"
              alt="Crownlinks Academy Logo"
              className="h-6 w-auto"
            />
            <div className="text-lg font-bold">Crownlinks Academy</div>
          </div>
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
