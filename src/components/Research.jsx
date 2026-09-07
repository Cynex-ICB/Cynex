import { Link } from 'react-router-dom';
import {
  FlaskConical,
  Cpu,
  ShieldCheck,
  Boxes,
  FileCode2,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Award,
  Network,
  Binary,
} from 'lucide-react';

const researchGroups = [
  {
    id: 'iot-edge',
    title: 'IoT & Edge Intelligence Research Group',
    lead: 'Prof. Vasudev S. Shahapur',
    icon: Cpu,
    summary: 'Focusing on low-power wide-area networks (LPWAN), sensor telemetry, real-time embedded operating systems, and intelligent inference directly at edge sensor gateways.',
    topics: [
      'Industrial IoT Telemetry via MQTT & LoRaWAN',
      'TinyML & On-Device Microcontroller Inference',
      'Smart Agriculture & Environmental Monitoring Systems',
      'Embedded Firmware Security & Hardware Tamper Resistance',
    ],
    projects: [
      'Precision Agricultural Sensor Grid for Coastal Karnataka climate conditions',
      'Campus LoRaWAN Mesh Network for smart energy and water metering',
    ],
  },
  {
    id: 'cyber-vapt',
    title: 'Cybersecurity, Defense & Threat Analysis Group',
    lead: 'Prof. Savitha S K',
    icon: ShieldCheck,
    summary: 'Investigating automated vulnerability assessment, penetration testing frameworks, malware signature analysis, network intrusion mitigation, and cryptographic key exchange architectures.',
    topics: [
      'Offensive Penetration Testing & Vulnerability Discovery',
      'Intrusion Detection Systems (Snort, Suricata) Tuning',
      'Digital Forensics & Incident Response Workflows',
      'Post-Quantum Cryptographic Protocols',
    ],
    projects: [
      'Automated Vulnerability Scanner for academic web portals',
      'Network Traffic Anomaly Detection using unsupervised machine learning',
    ],
  },
  {
    id: 'blockchain-dlt',
    title: 'Distributed Ledgers & Smart Contract Architecture',
    lead: 'Prof. Fayaz Ahmed Sheik',
    icon: Boxes,
    summary: 'Researching Byzantine Fault Tolerant consensus algorithms, EVM bytecode optimization, formal verification of Solidity smart contracts, and decentralized credential verification.',
    topics: [
      'EVM Smart Contract Security & Gas Optimization',
      'Decentralized Identity (DID) & Academic Credentialing',
      'Cross-Chain Bridge Security & Interoperability',
      'Zero-Knowledge Proofs for Verifiable Computing',
    ],
    projects: [
      'Tamper-Proof Academic Transcript Verification on private Ethereum testnet',
      'Decentralized Voting System with cryptographic ballot auditing',
    ],
  },
  {
    id: 'ai-vision',
    title: 'Applied AI & Computer Vision Group',
    lead: 'Prof. Joytibha R Chichankar',
    icon: Binary,
    summary: 'Developing algorithms for visual pattern recognition, edge-accelerated computer vision, language representations, and theoretical computational complexity.',
    topics: [
      'Real-Time Computer Vision on Embedded Hardware',
      'Automated Document OCR for Academic Archival',
      'Theory of Computation & Algorithmic Efficiency',
      'Deep Learning for Medical Image Screening',
    ],
    projects: [
      'Automated Classroom Attendance Verification using facial landmark detection',
      'Defect Detection System for industrial manufacturing quality control',
    ],
  },
];

const publicationHighlights = [
  {
    title: 'Energy-Efficient Telemetry Protocols for Multi-Hop LoRaWAN Environmental Grids',
    venue: 'International Conference on Emerging Computing Technologies (ICECT)',
    year: '2025',
    authors: 'V. S. Shahapur et al.',
    domain: 'IoT & Hardware',
  },
  {
    title: 'Evaluating Zero-Day Vulnerabilities in Web3 Smart Contract Bridges',
    venue: 'Journal of Cybersecurity & Information Assurance',
    year: '2024',
    authors: 'S. S. K, F. A. Sheik et al.',
    domain: 'Cybersecurity',
  },
  {
    title: 'Decentralized Identity Verification for University Examinations using EVM Standards',
    venue: 'IEEE Region 10 Symposium (TENSYMP)',
    year: '2024',
    authors: 'F. A. Sheik et al.',
    domain: 'Blockchain',
  },
];

function Research() {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-16 text-academic-text">
      
      {/* Page Hero */}
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-academic-navy text-white text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <FlaskConical className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>Academic Research &amp; Innovation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            Research Centers &amp; Thrust Areas
          </h1>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-2 leading-relaxed">
            Fostering an ecosystem of applied inquiry, faculty-student collaboration, and engineering problem-solving across Internet of Things, Cybersecurity, and Distributed Ledger systems.
          </p>
        </div>
      </section>

      {/* Research Domains - Editorial Layout */}
      <section className="space-y-8">
        <div>
          <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
            Specialized Groups
          </span>
          <h2 className="text-2xl font-bold text-academic-navy mt-1">
            Department Research Initiatives
          </h2>
          <p className="text-xs sm:text-sm text-academic-text-muted">
            Guided by senior faculty members with active student project teams
          </p>
        </div>

        <div className="space-y-6">
          {researchGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.id} className="institutional-card p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-academic-border pb-5 mb-5">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-md bg-academic-navy text-white flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-academic-gold-light" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-academic-navy">{group.title}</h3>
                      <p className="text-xs sm:text-sm text-academic-text-muted mt-0.5">
                        Group Coordinator: <strong className="text-academic-navy font-semibold">{group.lead}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="inline-block self-start px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold">
                    Active Research Track
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-academic-text-secondary leading-relaxed mb-6">
                  {group.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-academic-navy uppercase tracking-wider">
                      Key Research Topics:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-academic-text-secondary">
                      {group.topics.map((topic) => (
                        <li key={topic} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-academic-accent flex-shrink-0 mt-0.5" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-academic-navy uppercase tracking-wider">
                      Selected Capstone &amp; Lab Projects:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-academic-text-secondary">
                      {group.projects.map((proj) => (
                        <li key={proj} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-academic-gold-dark flex-shrink-0 mt-1.5" />
                          <span>{proj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Selected Publications Section */}
      <section className="space-y-6">
        <div className="border-b border-academic-border pb-4">
          <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
            Scholarly Output
          </span>
          <h2 className="text-2xl font-bold text-academic-navy mt-1">
            Selected Faculty &amp; Student Publications
          </h2>
          <p className="text-xs sm:text-sm text-academic-text-muted">
            Peer-reviewed research published in national and international proceedings
          </p>
        </div>

        <div className="space-y-3.5">
          {publicationHighlights.map((pub) => (
            <div key={pub.title} className="institutional-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-block px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-mono font-semibold uppercase">
                  {pub.domain} • {pub.year}
                </span>
                <h4 className="text-sm font-bold text-academic-navy">{pub.title}</h4>
                <p className="text-xs text-academic-text-muted">
                  {pub.authors} • <em>{pub.venue}</em>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collaboration & Projects Callout */}
      <section className="institutional-card p-6 sm:p-8 bg-academic-bg border-academic-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-academic-navy">
              Industry Collaborations &amp; Student Capstone Inquiries
            </h3>
            <p className="text-xs sm:text-sm text-academic-text-secondary max-w-2xl leading-relaxed">
              We welcome industry partners interested in sponsoring research benches, student capstone challenges, and proof-of-concept deployments in IoT, Cybersecurity, or Blockchain.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-md bg-academic-navy hover:bg-academic-navy-light text-white text-xs font-semibold shadow-soft whitespace-nowrap transition-colors"
          >
            Contact Research Office
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Research;
