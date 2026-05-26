import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="hero-section" id="home">
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
    </section>
  );
}

export default Hero;
