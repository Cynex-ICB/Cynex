const facultyMembers = [
  {
    name: 'Prof Vasudev S Shahapur',
    role: 'Head of the Department',
    focus: 'IoT & Embedded Systems',
  },
  {
    name: 'Prof. Fayaz Ahmed Sheik',
    role: 'Assistant Professor',
    focus: 'Web Technologies, Database Systems',
  },
  {
    name: 'Prof. Joytibha R Chichankar',
    role: 'Assistant Professor',
    focus: 'ToC , AI and Computer Vision',
  },
  {
    name: 'Prof. Savitha S K',
    role: 'Assistant Professor',
    focus: 'Cybersecurity and VAPT',
  },
];

import { motion } from 'framer-motion';

function Faculty() {
  return (
    <motion.section
      className="section alt-section"
      id="faculty"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      <div className="section-heading">
        <p className="eyebrow">Team</p>
        <h2>Faculty</h2>
      </div>

      <div className="grid">
        {facultyMembers.map((member, index) => (
          <motion.article
            className="card faculty-card"
            key={member.name + member.focus}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.05 }}
          >
            <div className="avatar-placeholder">{member.name.charAt(0)}</div>
            <h3>{member.name}</h3>
            <p className="muted">{member.role}</p>
            <p>{member.focus}</p>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}

export default Faculty;
