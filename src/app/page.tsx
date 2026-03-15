import Link from "next/link";
import {
  ArrowRightLeft,
  Target,
  Zap,
  Shield,
  Timer,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DrillGrid } from "@/components/drill-grid";
import { getFeaturedDrills } from "@/lib/drills";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/constants";
import { Category } from "@/types/drill";

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  passing: <ArrowRightLeft className="h-8 w-8" />,
  shooting: <Target className="h-8 w-8" />,
  dribbling: <Zap className="h-8 w-8" />,
  defending: <Shield className="h-8 w-8" />,
  fitness: <Timer className="h-8 w-8" />,
};

export default function HomePage() {
  const featured = getFeaturedDrills();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute top-[30%] right-[20%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="glass-subtle mx-auto inline-block rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-6">
            Interactive pitch diagrams & session planning
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Design Better
            <span className="text-primary"> Training Sessions</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Browse professional football drills with interactive pitch diagrams.
            Build sessions, track time, and elevate your coaching.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/drills">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                Browse Drills
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/session-builder">
              <Button variant="outline" size="lg" className="glass">
                Build a Session
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-bold mb-6">Drill Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <Link key={cat} href={`/drills?category=${cat}`}>
                <Card className="group cursor-pointer glass transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                  <CardContent className="flex flex-col items-center gap-3 py-6">
                    <div
                      className="rounded-xl p-3 transition-all group-hover:scale-110"
                      style={{
                        backgroundColor: meta.color + "12",
                        color: meta.color,
                      }}
                    >
                      {CATEGORY_ICONS[cat as Category]}
                    </div>
                    <span className="font-semibold text-sm">{meta.label}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Drills */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Drills</h2>
          <Link href="/drills">
            <Button variant="ghost" className="gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <DrillGrid drills={featured} />
      </section>
    </div>
  );
}
