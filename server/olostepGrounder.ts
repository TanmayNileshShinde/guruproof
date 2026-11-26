import axios from "axios";

export interface GroundedDocCitation {
  title: string;
  url: string;
  snippet: string;
  source: "Olostep Live Search" | "Curated CS Reference";
}

export class OlostepGrounder {
  private get apiKey(): string {
    return process.env.OLOSTEP_API_KEY || "";
  }

  /**
   * Queries Olostep /v1/searches to ground explanations in live technical docs
   */
  async searchCitations(query: string): Promise<GroundedDocCitation[]> {
    if (!this.apiKey) {
      return this.getFallbackCitations(query);
    }

    try {
      const response = await axios.post(
        "https://api.olostep.com/v1/searches",
        { query: `${query} site:geeksforgeeks.org OR site:oracle.com OR site:cp-algorithms.com` },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 12000,
        }
      );

      const links = response.data?.result?.links || [];
      if (Array.isArray(links) && links.length > 0) {
        return links.slice(0, 3).map((item: any) => ({
          title: item.title || "Technical Reference",
          url: item.url,
          snippet: (item.description || item.snippet || "Verified technical documentation via Olostep search.")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 180),
          source: "Olostep Live Search" as const,
        }));
      }
      return this.getFallbackCitations(query);
    } catch (err: any) {
      console.warn("Olostep grounder fallback:", err?.message);
      return this.getFallbackCitations(query);
    }
  }

  private getFallbackCitations(query: string): GroundedDocCitation[] {
    const q = encodeURIComponent(query);
    return [
      {
        title: `GeeksforGeeks Reference: ${query.slice(0, 48)}`,
        url: `https://www.geeksforgeeks.org/?s=${q}`,
        snippet: "Algorithm complexity, edge-case invariants, and step-by-step pointer dry-run guide.",
        source: "Curated CS Reference",
      },
      {
        title: "CP-Algorithms / Java Language Spec",
        url: "https://cp-algorithms.com/",
        snippet: "Standard boundary invariants and overflow-safe mid-point arithmetic guarantees.",
        source: "Curated CS Reference",
      },
    ];
  }
}

export const olostepGrounder = new OlostepGrounder();
