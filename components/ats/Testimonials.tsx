"use client";

const testimonials = [
  {
    quote:
      "I was applying to jobs for months with no response. After using C&L ATS Optimizer, I got 3 interview requests in the first week!",
    author: "Sarah M.",
    role: "Marketing Manager",
    company: "Got hired at Fortune 500",
  },
  {
    quote:
      "The ATS optimization made all the difference. My resume was finally getting past the automated screening. Landed my dream job at Google.",
    author: "James K.",
    role: "Software Engineer",
    company: "Now at FAANG",
  },
  {
    quote:
      "Worth every penny. The one-page condenser feature helped me cut the fluff and focus on what matters. 10/10 would recommend.",
    author: "Emily R.",
    role: "Product Manager",
    company: "Career switcher success",
  },
];

export function Testimonials() {
  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-gold/10 text-gold rounded-full mb-3">
          SUCCESS STORIES
        </span>
        <h2 className="text-2xl font-bold mb-2 text-ink dark:text-cream">
          Trusted by Job Seekers
        </h2>
        <p className="text-ink-soft dark:text-parchment-dark">
          Join thousands who&apos;ve landed their dream jobs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="p-6 bg-cream/80 dark:bg-navy/80 border border-mist/50 dark:border-ink-soft/30 rounded-xl backdrop-blur-sm transition-all hover:shadow-card"
          >
            <p className="text-ink dark:text-cream mb-4 leading-relaxed">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-medium">
                {testimonial.author.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-sm text-ink dark:text-cream">
                  {testimonial.author}
                </div>
                <div className="text-xs text-ink-soft dark:text-parchment-dark">
                  {testimonial.role}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  {testimonial.company}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 text-gold"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
