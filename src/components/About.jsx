import { motion } from 'framer-motion';

function About() {
  return (
    <motion.section
      className="section"
      id="about"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      <div className="section-heading">
        <p className="eyebrow">About</p>
        <h2>About Department</h2>
      </div>

      <div className="card about-card">
        <p>
          The Department of CSE (ICB) encourages students to build strong
          foundations in programming, data structures, software development,
          cloud technologies, cybersecurity, artificial intelligence, and
          modern computing practices.
        </p>
        <p>
          Through project-based learning, technical events, mentoring, and
          collaborative activities, the department helps students become
          confident engineers who can design meaningful solutions.
        </p>
      </div>
    </motion.section>
  );
}

export default About;
