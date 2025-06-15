import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui";
import { Navbar, Footer } from "@/components/layout";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900">
            Welcome to <span className="text-blue-600">UniCal</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600 max-w-2xl mx-auto">
            Unify your calendars from Google, Outlook, and more in one place.
            Streamline your scheduling and never miss an important event again.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-3xl font-bold text-center text-gray-900">
          Why Choose UniCal?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">🗓️ Unified View</CardTitle>
              <CardDescription className="text-center">
                See all your calendars in one place with our intuitive interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Aggregate events from Google Calendar, Microsoft Outlook, and
                other platforms for a complete view of your schedule.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">🔄 Two-Way Sync</CardTitle>
              <CardDescription className="text-center">
                Changes sync automatically across all your connected calendars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Create, edit, or delete events in UniCal and watch them update
                seamlessly across all your calendar platforms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">🔒 Secure & Private</CardTitle>
              <CardDescription className="text-center">
                Your calendar data is protected with enterprise-grade security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                We use OAuth 2.0 and industry-standard encryption to keep your
                calendar information safe and private.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Simplify Your Calendar Management?
          </h2>
          <p className="mb-8 text-xl opacity-90">
            Join thousands of users who have streamlined their scheduling with
            UniCal.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
