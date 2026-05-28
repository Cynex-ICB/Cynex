import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Hero() {
  return (
    <motion.section
      className="hero-section"
      id="home"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: 'easeOut' }}
    >
      <div className="hero-content">
        <p className="eyebrow">Innovate. Compute. Build.</p>
        <h2>Department of CSE(IoT,Cybersecurity including Blockchain Technology)</h2>
        <p>
          Welcome to a learning space focused on computing fundamentals,
          intelligent systems, creativity, and industry-ready problem solving.
        </p>
        <Link className="primary-button" to="/faculty">
          Explore Branch
        </Link>
      </div>
    </motion.section>
  );
}

export default Hero;
