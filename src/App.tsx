import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { ask } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  Search,
  Skull,
  Copy,
  Network,
  Loader2,
  Globe,
} from "lucide-react";

interface PortInfo {
  port: number;
  protocol: string;
  pid: number;
  process_name: string;
  command: string;
  address: string;
}

function App() {
  const { t, i18n } = useTranslation();
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [killing, setKilling] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await invoke<PortInfo[]>("list_ports");
      setPorts(result);
    } catch (e) {
      console.error("Failed to list ports:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function toggleLang() {
    const next = i18n.language === "zh-CN" ? "en" : "zh-CN";
    i18n.changeLanguage(next);
    localStorage.setItem("portman-language", next);
  }

  async function handleKill(pid: number, name: string) {
    try {
      const yes = await ask(t("kill.confirm", { name: name || "unknown", pid }), {
        title: t("kill.title"),
        kind: "warning",
      });
      if (!yes) return;
    } catch (e) {
      console.error("dialog error:", e);
      return;
    }
    setKilling(pid);
    try {
      await invoke("kill_process", { pid });
      setTimeout(refresh, 500);
    } catch (e) {
      console.error("kill error:", e);
    }
    setKilling(null);
  }

  function handleCopy(port: number) {
    navigator.clipboard.writeText(String(port));
    setCopied(port);
    setTimeout(() => setCopied(null), 1500);
  }

  const filtered = ports.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(p.port).includes(q) ||
      p.process_name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      String(p.pid).includes(q)
    );
  });

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Network className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight">{t("app.name")}</h1>
          <Badge variant="secondary" className="text-xs">
            {t("header.ports", { count: ports.length })}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder={t("header.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 w-64 text-sm rounded-lg border border-input bg-transparent px-2.5 py-1 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
            />
          </div>
          <Button variant="outline" size="sm" onClick={toggleLang} title="Switch language">
            <Globe className="h-3.5 w-3.5 mr-1.5" />
            {i18n.language === "zh-CN" ? "EN" : "中文"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`}
            />
            {t("header.refresh")}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading && ports.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            {t("scan.loading")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">{t("table.port")}</TableHead>
                <TableHead className="w-20">{t("table.protocol")}</TableHead>
                <TableHead className="w-36">{t("table.address")}</TableHead>
                <TableHead className="w-20">{t("table.pid")}</TableHead>
                <TableHead>{t("table.process")}</TableHead>
                <TableHead className="w-80">{t("table.command")}</TableHead>
                <TableHead className="w-20 text-right">{t("table.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p, i) => (
                <TableRow key={`${p.port}-${p.protocol}-${i}`}>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-sm">
                        {p.port}
                      </span>
                      <button
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => handleCopy(p.port)}
                        title={copied === p.port ? t("copy.done") : t("copy.tooltip")}
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        p.protocol === "TCP"
                          ? "border-blue-500/30 text-blue-500"
                          : "border-amber-500/30 text-amber-500"
                      }`}
                    >
                      {p.protocol}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {p.address || "*"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {p.pid}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {p.process_name || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-xs text-muted-foreground font-mono truncate block max-w-[300px]"
                      title={p.command || undefined}
                    >
                      {p.command || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleKill(p.pid, p.process_name)}
                      disabled={killing === p.pid || p.pid === 0}
                      title={t("kill.tooltip")}
                    >
                      <Skull className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-12"
                  >
                    {search ? t("table.noMatch") : t("table.empty")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default App;
