import Link from "next/link";
import { headers } from "next/headers";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const headersList = await headers();
  const pathname = new URL(headersList.get("x-url") || "http://localhost").pathname;

  function navProps(href: string) {
    const isActive = pathname === href;
    return {
      href,
      className: `text-sm font-medium ${isActive ? "text-primary" : "text-gray-600 hover:text-gray-900"}`,
      ...(isActive ? { "aria-current": "page" as const } : {}),
    };
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-primary">ReqFlow</h1>
              <nav className="flex gap-6">
                <Link {...navProps("/")}>
                  工作台
                </Link>
                <Link {...navProps("/tickets")}>
                  工单
                </Link>
                {session.user.role === "admin" && (
                  <>
                    <Link {...navProps("/admin/knowledge")}>
                      知识库
                    </Link>
                    <Link {...navProps("/admin/ai-provider")}>
                      AI Provider
                    </Link>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-gray-500">
                  {ROLE_LABELS[session.user.role] || session.user.role}
                </p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <Button variant="outline" size="sm" type="submit">
                  退出
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
