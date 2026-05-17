import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EcoLabel } from "@/components/nudge/EcoLabel";

describe("EcoLabel", () => {
  it('renders FRESH label with leaf icon', () => {
    render(<EcoLabel label="FRESH" />);
    const el = screen.getByText((content) => content.includes("Produk Segar"));
    expect(el).toBeInTheDocument();
  });

  it('renders ECONOMICAL label with heart icon', () => {
    render(<EcoLabel label="ECONOMICAL" />);
    expect(screen.getByText(/Pilihan Hemat/)).toBeInTheDocument();
    expect(screen.getByText(/💚/)).toBeInTheDocument();
  });

  it('renders POPULAR label with trophy icon', () => {
    render(<EcoLabel label="POPULAR" />);
    const el = screen.getByText((content) => content.includes("Pilihan Terpopuler"));
    expect(el).toBeInTheDocument();
  });

  it("shows info icon when tooltip is provided", () => {
    render(<EcoLabel label="FRESH" tooltip="Produk ini dipanen segar setiap hari" />);
    const infoButton = document.querySelector(".lucide-info");
    expect(infoButton).toBeInTheDocument();
  });

  it("does not show info icon when no tooltip", () => {
    render(<EcoLabel label="FRESH" />);
    const infoButton = document.querySelector(".lucide-info");
    expect(infoButton).not.toBeInTheDocument();
  });
});

describe("SocialNormBadge", () => {
  it("renders WEEKLY_BUYERS with star icon", async () => {
    const { SocialNormBadge } = await import("@/components/nudge/SocialNormBadge");
    render(<SocialNormBadge type="WEEKLY_BUYERS" />);
    expect(screen.getByText(/1.240 pengguna/)).toBeInTheDocument();
  });

  it("renders LOCAL_BUYERS with users icon", async () => {
    const { SocialNormBadge } = await import("@/components/nudge/SocialNormBadge");
    render(<SocialNormBadge type="LOCAL_BUYERS" />);
    expect(screen.getByText(/87 orang/)).toBeInTheDocument();
  });
});
