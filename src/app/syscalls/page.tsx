"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SystemCallsPage() {
  const { data: session } = useSession();
  const [syscalls, setSyscalls] = useState<any[]>([]);
  const [selectedSyscall, setSelectedSyscall] = useState<any>(null);
  const [parameters, setParameters] = useState<any>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSyscalls();
  }, []);

  const fetchSyscalls = async () => {
    try {
      const response = await fetch("/api/syscall");
      if (response.ok) {
        const data = await response.json();
        setSyscalls(data.syscalls);
      }
    } catch (error) {
      console.error("Failed to fetch syscalls:", error);
    }
  };

  const handleExecute = async () => {
    if (!selectedSyscall) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/syscall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syscallName: selectedSyscall.name,
          parameters,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Execution failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">System Calls</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Execution Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Execute System Call</CardTitle>
              <CardDescription>Select and execute available system calls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>System Call</Label>
                <Select
                  onValueChange={(value) => {
                    const syscall = syscalls.find((s) => s.name === value);
                    setSelectedSyscall(syscall);
                    setParameters({});
                    setResult(null);
                    setError("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a system call" />
                  </SelectTrigger>
                  <SelectContent>
                    {syscalls.map((syscall) => (
                      <SelectItem key={syscall.id} value={syscall.name}>
                        {syscall.name} - {syscall.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSyscall && selectedSyscall.requiresParams && (
                <>
                  {selectedSyscall.name.includes("File") || selectedSyscall.name.includes("Directory") ? (
                    <div className="space-y-2">
                      <Label htmlFor="path">Path</Label>
                      <Input
                        id="path"
                        placeholder="/example/path"
                        value={parameters.path || ""}
                        onChange={(e) => setParameters({ ...parameters, path: e.target.value })}
                      />
                    </div>
                  ) : null}

                  {selectedSyscall.name === "writeFile" && (
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        placeholder="File content..."
                        value={parameters.content || ""}
                        onChange={(e) => setParameters({ ...parameters, content: e.target.value })}
                      />
                    </div>
                  )}

                  {selectedSyscall.name === "runSafeCommand" && (
                    <div className="space-y-2">
                      <Label htmlFor="command">Command</Label>
                      <Input
                        id="command"
                        placeholder="dir, echo, date, time"
                        value={parameters.command || ""}
                        onChange={(e) => setParameters({ ...parameters, command: e.target.value })}
                      />
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>
              )}

              <Button onClick={handleExecute} disabled={!selectedSyscall || loading} className="w-full">
                {loading ? "Executing..." : "Execute"}
              </Button>
            </CardContent>
          </Card>

          {/* Result Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>System call execution output</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      SUCCESS
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Execution Time:</span>
                    <span className="ml-2 text-sm text-gray-600">{result.executionTime}ms</span>
                  </div>
                  <div>
                    <Label>Output:</Label>
                    <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded-md overflow-x-auto text-sm">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No results yet. Execute a system call to see output.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available System Calls Reference */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Available System Calls</CardTitle>
            <CardDescription>Your role has access to the following system calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {syscalls.map((syscall) => (
                <div key={syscall.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-1">{syscall.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{syscall.description}</p>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {syscall.category}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
