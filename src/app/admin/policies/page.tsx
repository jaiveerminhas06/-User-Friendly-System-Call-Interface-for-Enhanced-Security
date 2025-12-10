"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function AdminPoliciesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [systemCalls, setSystemCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchPolicies();
  }, [session]);

  const fetchPolicies = async () => {
    try {
      const response = await fetch("/api/admin/policies");
      if (response.ok) {
        const data = await response.json();
        setSystemCalls(data.systemCalls);
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSystemCall = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch("/api/admin/policies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemCallId: id, enabled: !enabled }),
      });

      if (response.ok) {
        fetchPolicies();
      }
    } catch (error) {
      console.error("Failed to toggle system call:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Policy Management</h1>

        <Card>
          <CardHeader>
            <CardTitle>System Calls</CardTitle>
            <CardDescription>Manage system call availability and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Total Executions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemCalls.map((syscall) => (
                    <TableRow key={syscall.id}>
                      <TableCell className="font-mono text-sm">{syscall.name}</TableCell>
                      <TableCell className="text-sm">{syscall.description}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {syscall.category}
                        </span>
                      </TableCell>
                      <TableCell>{syscall._count.logs}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            syscall.enabled
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {syscall.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={syscall.enabled ? "destructive" : "default"}
                          onClick={() => toggleSystemCall(syscall.id, syscall.enabled)}
                        >
                          {syscall.enabled ? "Disable" : "Enable"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
