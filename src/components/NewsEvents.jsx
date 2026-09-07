import { useState } from 'react';
import { Calendar, Bell, Clock, MapPin, Tag, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';

const departmentNews = [
  {
    id: 'news-1',
    day: '18',
    month: 'OCT',
    year: '2026',
    category: 'VTU Notification',
    title: 'VTU Semester Examination Form Submission & Fee Schedule',
    summary: 'Visvesvaraya Technological University has announced the last date for submitting online examination applications for B.E. 3rd, 5th, and 7th semester students under 2021 & 2022 schemes.',
    priority: 'high',
  },
  {
    id: 'news-2',
    day: '05',
    month: 'OCT',
    year: '2026',
    category: 'Academic Circular',
    title: 'Continuous Internal Evaluation (CIE-II) Assessment Timetable',
    summary: 'The Department CIE Committee has released the schedule for the second series of internal theory assessments and laboratory practical examinations for all CSE (ICB) batches.',
    priority: 'normal',
  },
  {
    id: 'news-3',
    day: '24',
    month: 'SEP',
    year: '2026',
    category: 'Research Workshop',
    title: 'Faculty Development Program on Post-Quantum Cryptography & VAPT',
    summary: 'A 3-day technical symposium hosted in collaboration with industry security practitioners, focusing on practical network vulnerability assessment and cryptographic resilience.',
    priority: 'normal',
  },
  {
    id: 'news-4',
    day: '12',
    month: 'SEP',
    year: '2026',
    category: 'Student Conclave',
    title: 'CYNEX TechExpo: 4th Year Capstone Project Showcase',
    summary: 'Final year undergraduate students demonstrated 20+ working prototypes covering IoT agricultural telemetry, EVM smart contracts, and decentralized identity systems.',
    priority: 'normal',
  },
];

const upcomingEvents = [
  {
    id: 'event-1',
    title: 'Hands-on Bootcamp: Embedded C & LoRaWAN Node Development',
    date: 'Saturday, October 24, 2026',
    time: '09:30 AM – 04:30 PM',
    venue: 'IoT & Embedded Systems Laboratory (Room 214)',
    type: 'Technical Workshop',
    speaker: 'Industry IoT Solutions Architect',
  },
  {
    id: 'event-2',
    title: 'National Level CTF & Penetration Testing Tournament',
    date: 'Friday & Saturday, November 06–07, 2026',
    time: '36-Hour Continuous Sprint',
    venue: 'AIET Central Computing Center & Virtual Sandbox',
    type: 'Competitive Hackathon',
    speaker: 'CYNEX Student Society & Cyber Defense Club',
  },
  {
    id: 'event-3',
    title: 'Guest Lecture: Formal Verification of Smart Contracts',
    date: 'Wednesday, November 18, 2026',
    time: '02:00 PM – 04:00 PM',
    venue: 'Seminar Hall 2, Academic Block',
    type: 'Academic Seminar',
    speaker: 'Dr. K. R. Bhat, Blockchain Research Fellow',
  },
];

function NewsEvents() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-16 text-academic-text">
      
      {/* Header Banner */}
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-academic-navy text-white text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <Bell className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>Notices &amp; Schedules</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            News, Circulars &amp; Department Events
          </h1>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-2 leading-relaxed">
            Official announcements, VTU university notifications, academic evaluation schedules, and upcoming technical symposiums for the Department of CSE (ICB).
          </p>
        </div>
      </section>

      {/* Announcements & Circulars */}
      <section className="space-y-6">
        <div className="border-b border-academic-border pb-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
              Official Bulletin
            </span>
            <h2 className="text-2xl font-bold text-academic-navy mt-0.5">
              Department Notices &amp; Circulars
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          {departmentNews.map((item) => (
            <article
              key={item.id}
              className="institutional-card p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start"
            >
              {/* Prominent Academic Date Badge */}
              <div className="w-16 h-16 rounded-md bg-academic-navy text-white flex flex-col items-center justify-center flex-shrink-0 text-center shadow-soft border border-academic-gold/20">
                <span className="text-xl font-extrabold leading-none text-academic-gold-light">
                  {item.day}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold mt-0.5">
                  {item.month} {item.year}
                </span>
              </div>

              {/* Notice Content */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-semibold uppercase">
                    {item.category}
                  </span>
                  {item.priority === 'high' && (
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-mono font-bold uppercase">
                      Urgent
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-academic-navy leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-academic-text-secondary leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="space-y-6">
        <div className="border-b border-academic-border pb-3">
          <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
            Academic Calendar
          </span>
          <h2 className="text-2xl font-bold text-academic-navy mt-0.5">
            Upcoming Technical Events &amp; Workshops
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((evt) => (
            <div key={evt.id} className="institutional-card p-6 flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-mono font-semibold uppercase mb-3">
                  {evt.type}
                </span>
                <h3 className="text-base font-bold text-academic-navy leading-snug mb-3">
                  {evt.title}
                </h3>
                
                <div className="space-y-2 text-xs text-academic-text-secondary pt-2 border-t border-academic-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-academic-accent flex-shrink-0" />
                    <span className="font-medium text-academic-navy">{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-academic-accent flex-shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-academic-accent flex-shrink-0" />
                    <span>{evt.venue}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <span className="text-[11px] text-academic-text-muted block">
                  Coordinator: <strong className="text-academic-navy">{evt.speaker}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default NewsEvents;
