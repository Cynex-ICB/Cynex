import { MapPin, Phone, Mail, Clock, Building2, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 text-academic-text">
      
      {/* Header Banner */}
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-academic-navy text-white text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>Institutional Contact</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            Contact Department Office
          </h1>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-2 leading-relaxed">
            Reach out to the Department of Computer Science &amp; Engineering (IoT, Cyber Security including Blockchain Technology) at Alva&apos;s Institute of Engineering &amp; Technology.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Coordinates (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="institutional-card p-6 sm:p-7 space-y-6">
            <div>
              <span className="text-[11px] font-mono text-academic-gold-dark uppercase tracking-wider block font-semibold">
                Campus Location
              </span>
              <h2 className="text-lg font-bold text-academic-navy mt-1">
                Alva&apos;s Institute of Engineering &amp; Technology
              </h2>
              <p className="text-xs text-academic-text-muted mt-0.5">
                A Unit of Alva&apos;s Education Foundation (R)
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-academic-text-secondary">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-academic-accent flex-shrink-0 mt-1" />
                <div>
                  <strong className="text-academic-navy font-semibold block">Campus Address:</strong>
                  <span>Shobhavana Campus, Mijar, Moodbidri, Dakshina Kannada District, Karnataka - 574225, India</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-academic-accent flex-shrink-0 mt-1" />
                <div>
                  <strong className="text-academic-navy font-semibold block">Department Office:</strong>
                  <span>Room 204 &amp; 206, Academic Block, AIET</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-academic-accent flex-shrink-0 mt-1" />
                <div>
                  <strong className="text-academic-navy font-semibold block">Telephone:</strong>
                  <span className="font-mono">08258-262725 / 262724</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-academic-accent flex-shrink-0 mt-1" />
                <div>
                  <strong className="text-academic-navy font-semibold block">Email Inquiries:</strong>
                  <a href="mailto:cse-icb@aiet.org.in" className="text-academic-accent hover:underline font-mono">
                    cse-icb@aiet.org.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-academic-accent flex-shrink-0 mt-1" />
                <div>
                  <strong className="text-academic-navy font-semibold block">Academic Working Hours:</strong>
                  <span>Monday – Friday: 09:00 AM to 05:00 PM<br />Saturday: 09:00 AM to 01:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inquiry Message Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="institutional-card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-academic-navy mb-1">
              Send an Academic or Admissions Inquiry
            </h2>
            <p className="text-xs text-academic-text-muted mb-6">
              Our departmental coordination desk will direct your query to the appropriate faculty proctor or admissions advisor.
            </p>

            {submitted ? (
              <div className="p-6 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold">Inquiry Transmitted</h3>
                <p className="text-xs">Thank you. Your message has been routed to the Department of CSE (ICB) coordination desk.</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-3 px-4 py-1.5 rounded bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-academic-navy">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded border border-academic-border bg-white text-academic-text focus:outline-none focus:ring-2 focus:ring-academic-navy/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-academic-navy">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. applicant@domain.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded border border-academic-border bg-white text-academic-text focus:outline-none focus:ring-2 focus:ring-academic-navy/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-academic-navy">Inquiry Category *</label>
                  <select
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded border border-academic-border bg-white text-academic-text focus:outline-none focus:ring-2 focus:ring-academic-navy/20"
                  >
                    <option value="">Select Category</option>
                    <option value="admissions">Undergraduate B.E. Admissions</option>
                    <option value="curriculum">VTU Curriculum &amp; Study Materials</option>
                    <option value="research">Research Collaboration &amp; Capstone Sponsorship</option>
                    <option value="placements">Campus Placement &amp; Internship Partnership</option>
                    <option value="other">General Department Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-academic-navy">Message / Query Details *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your question or requirement..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded border border-academic-border bg-white text-academic-text focus:outline-none focus:ring-2 focus:ring-academic-navy/20"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-academic-navy hover:bg-academic-navy-light text-white text-xs font-semibold shadow-soft transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Department Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default Contact;

