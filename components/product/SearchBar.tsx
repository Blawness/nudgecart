"use client";

import { useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = "Cari produk...",
  className,
}: SearchBarProps) {
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const query = formData.get("q")?.toString().trim();
      if (query) {
        router.push(`/?q=${encodeURIComponent(query)}`);
      }
    },
    [router]
  );

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name="q"
        type="search"
        placeholder={placeholder}
        className="pl-8"
      />
    </form>
  );
}
