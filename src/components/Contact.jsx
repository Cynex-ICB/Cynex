import { motion } from 'framer-motion';

function Contact() {
  return (
    <motion.section
      className="section alt-section"
      id="contact"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      <div className="section-heading">
        <p className="eyebrow">Reach Us</p>
        <h2>Contact Us</h2>
      </div>

      <div className="card contact-card">
        <div>
          <h3>Department of CSE (IoT,Cybersecurity including Blockchain Technology)</h3>
          <p>Alva's Institute of Engineering and Technology</p>
          <p>Mijar, Moodbidri, Karnataka</p>
        </div>

        <div className="contact-details">
          <a href="mailto:cseicb@aiet.org.in">cseicb@aiet.org.in</a>
          <a href="tel:+910000000000">+91 00000 00000</a>
        </div>
      </div>
    </motion.section>
  );
}

export default Contact;
