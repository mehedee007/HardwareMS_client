// components/Footer.tsx
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Logo or text */}
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Naturub Accessories BD (Pvt.) Ltd. All rights reserved.
          </div>

          {/* Center separator for small screens */}
          <Separator className="md:hidden" />

          {/* Right side - Links */}
          <div className="flex items-center gap-4">
            <Link href="https://www.naturub.com/" target="_blank" className="text-sm text-muted-foreground hover:text-primary transition">
              About
            </Link>
            <Link href="https://www.naturub.com/contact-us/" target="_blank" className="text-sm text-muted-foreground hover:text-primary transition">
              Contact
            </Link>
            <Link href="https://www.naturub.com/" className="text-sm text-muted-foreground hover:text-primary transition">
              Privacy
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <Link href="https://github.com/kamrul-CSE-official" target="_blank" className="hover:text-primary">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-primary">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="https://bd.linkedin.com/company/naturubbd" target="_blank" className="hover:text-primary">
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
