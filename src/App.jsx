import { useEffect, useRef, useState } from "react";
import "./App.css";

function TelemetryDashboard() {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState("GITHUB");

  // GitHub Stats State
  const [ghStats, setGhStats] = useState({
    repos: 20,
    followers: 1,
    status: "ONLINE",
  });

  // LeetCode Stats State
  const [lcStats, setLcStats] = useState({
    solved: 120,
    easy: 45,
    medium: 65,
    hard: 10,
    ranking: "#250K",
  });

  useEffect(() => {
    // 1. Fetch GitHub Stats
    fetch("https://api.github.com/users/arjunpawar2007ap-arch")
      .then((res) => res.json())
      .then((data) => {
        if (data.public_repos !== undefined) {
          setGhStats({
            repos: data.public_repos,
            followers: data.followers || 0,
            status: "ONLINE",
          });
        }
      })
      .catch((err) => console.warn("GitHub fetch issue, fallback active.", err));

    // 2. Fetch LeetCode Stats
    fetch("https://leetcode-stats-api.herokuapp.com/napoleonictrafficcone08")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.totalSolved > 0) {
          setLcStats({
            solved: data.totalSolved,
            easy: data.easySolved,
            medium: data.mediumSolved,
            hard: data.hardSolved,
            ranking: data.ranking ? `#${data.ranking.toLocaleString()}` : "TOP 5%",
          });
        }
      })
      .catch((err) => console.warn("LeetCode API issue, using local stats.", err));
  }, []);

  // Oscilloscope Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let step = 0;

    const render = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Grid Background
      ctx.strokeStyle = "rgba(0, 255, 180, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Dynamic Waveform
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = activeTab === "GITHUB" ? "#00ffb4" : "#00c8ff";

      for (let x = 0; x < width; x++) {
        let y = height / 2;
        if (activeTab === "GITHUB") {
          y += Math.sin((x + step) * 0.03) * 18 + Math.sin((x - step) * 0.06) * 10;
        } else {
          y += Math.sin(Math.floor(x / 15) * 0.5 + step * 0.05) * 22;
        }
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Scanline
      const scanX = (step * 2) % width;
      ctx.strokeStyle = "rgba(0, 200, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(scanX, 0); ctx.lineTo(scanX, height); ctx.stroke();

      step += 1.5;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab]);

  return (
    <div className="telemetry-box">
      <div className="terminal-bar">
        <span className="terminal-dot red" />
        <span className="terminal-dot yellow" />
        <span className="terminal-dot green" />
        <span className="terminal-title">live_metrics.sys</span>
      </div>

      <div className="telemetry-content">
        <div className="telemetry-tabs">
          <button
            className={`telemetry-tab ${activeTab === "GITHUB" ? "active" : ""}`}
            onClick={() => setActiveTab("GITHUB")}
          >
            [GITHUB_FEED]
          </button>
          <button
            className={`telemetry-tab ${activeTab === "LEETCODE" ? "active" : ""}`}
            onClick={() => setActiveTab("LEETCODE")}
          >
            [LEETCODE_FEED]
          </button>
        </div>

        <div className="canvas-wrapper">
          <canvas ref={canvasRef} className="telemetry-canvas" />
          <div className="canvas-overlay">
            <span>FEED: {activeTab}</span>
            <span>STATUS: ACTIVE</span>
          </div>
        </div>

        {activeTab === "GITHUB" ? (
          <div className="telemetry-metrics">
            <div className="metric-card">
              <span className="metric-title">PUBLIC REPOS</span>
              <span className="metric-val highlight">{ghStats.repos}</span>
            </div>
            <div className="metric-card">
              <span className="metric-title">FOLLOWERS</span>
              <span className="metric-val">{ghStats.followers}</span>
            </div>
            <div className="metric-card full-width">
              <span className="metric-title">HANDLE</span>
              <span className="metric-val sub-text">@arjunpawar2007ap-arch</span>
            </div>
          </div>
        ) : (
          <div className="telemetry-metrics">
            <div className="metric-card">
              <span className="metric-title">TOTAL SOLVED</span>
              <span className="metric-val highlight">{lcStats.solved}</span>
            </div>
            <div className="metric-card">
              <span className="metric-title">RANKING</span>
              <span className="metric-val">{lcStats.ranking}</span>
            </div>
            <div className="metric-card full-width">
              <span className="metric-title">DIFFICULTY</span>
              <div className="difficulty-pills">
                <span className="pill easy">EASY: {lcStats.easy}</span>
                <span className="pill medium">MED: {lcStats.medium}</span>
                <span className="pill hard">HARD: {lcStats.hard}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const PROJECTS = [
  {
    name: "Relativistic_BlackHole-sim",
    tag: "Physics / Rendering",
    desc: "Schwarzschild geodesic ray tracer. 160k photon paths integrated through curved spacetime. Accretion disk lensing from first principles pure numpy.",
    link: "https://github.com/arjunpawar2007ap-arch/Relativistic_BlackHole_ray-traced_Render.git",
  },
  {
    name: "FDTD-EM-sim",
    tag: "Electromagnetism",
    desc: "Maxwell's equations on a 2D grid using FDTD. Proves the Veritasium circuit paradox, EM field reaches the bulb through space before it travels the wire.",
    link: "https://github.com/arjunpawar2007ap-arch/Veritasium_FDTD_sim.git",
  },
  {
    name: "Computational Design and Structural Analysis of a V12 Engine",
    tag: "CAD",
    desc: "Full V12 parametric CAD in Fusion 360 -> pistons, crankshaft, block, heads, manifolds. Component-level FEA in SimScale.",
    link: "https://github.com/arjunpawar2007ap-arch/V12_ENGINE.git",
  },
  {
    name: "EchoSight: Real-Time Assistive Navigation System for the Visually Impaired",
    tag: "Computer Vision",
    desc: "A camera-based navigation aid that detects nearby obstacles and announces them through prioritized voice alerts.",
    link: "https://github.com/arjunpawar2007ap-arch/Echosight-Real_time_assistive_navigation_system_for_the_blind.git",
  },
  {
    name: "Double-pendulum",
    tag: "Chaos Theory",
    desc: "Lagrangian mechanics + RK4 integration. Two pendulums start 0.001 rad apart and diverge completely sensitive dependence on initial conditions, visualized.",
    link: "https://github.com/arjunpawar2007ap-arch/double-pendulum",
  },
  {
    name: "4bit_CPU_datapath",
    tag: "Embedded Electronics",
    desc: "Designed from first principles. 600+ transitors, 900+ resistors hand placed and simulated in LTspice and Logisim.",
    link: "https://github.com/arjunpawar2007ap-arch/4Bit_CPU_datapath.git",
  },
];

const EXPERIENCE = [
  {
    role: "Computational Research Analyst",
    org: "Youth Economy Lab",
    period: "July, 2026 — Present",
    detail: "Selected for competitive global summer program to analyze the intersection of computer science frameworks, quantitative data, and economic systems, in collaberation with Dubai Computer Science Society.",
  },
  {
    role: "Undergraduate Student Researcher",
    org: "SYSCON, IIT Bombay",
    period: "June, 2026 — Present",
    detail: "Selected for the Summer Undergraduate Research Programme (SURP), working under the supervision of Prof. Rajasekhar Anguluri, on 'Evaluation of FinBERT Architecture and Adversarial Robustness in Financial Sentiment Analysis'.",
  },
  {
    role: "ML Research Intern",
    org: "FlyRank AI",
    period: "June, 2026 — Present",
    detail: "Self-paced research role. Working on ML pipelines and model experimentation.",
  },
  {
    role: "Trainee",
    org: "Team TorqueX, IITB",
    period: "October, 2025 — March, 2026",
    detail: "Managed media outreach by creating posts and generating content ideas to increase team visibility and audience engagement.",
  },
];

function GridBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let offset = 0;

    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const spacing = 50;
      ctx.strokeStyle = "rgba(0, 255, 180, 0.07)";
      ctx.lineWidth = 1;

      for (let x = offset % spacing; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = offset % spacing; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      offset += 0.3;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="grid-bg" />;
}

function TypewriterText({ text, speed = 60 }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return (
    <span>
      {displayed}
      <span className="cursor">█</span>
    </span>
  );
}

export default function App() {
  return (
    <div className="app">
      <GridBackground />

      <nav className="nav">
        <span className="nav-logo">AP://</span>
        <div className="nav-links">
          <a href="#projects">projects</a>
          <a href="#experience">experience</a>
          <a href="#contact">contact</a>
        </div>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <p className="hero-eyebrow">&gt; initializing...</p>
            <h1 className="hero-name">ARJUN PAWAR</h1>
            <p className="hero-tagline">
              <TypewriterText text="Mech Eng @ IIT Bombay · Building things and Experimenting my way through ENG ;)" />
            </p>
            <p className="hero-bio">
              Second year undergraduate obsessed with electronics, robotics, and quantitative systems. I like studying mathematics and physics, and occasionally building stuff with them.
              I like to take up challenging stuff, and spend my time tinkering and learning new things.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-num">20+</span>
                <span className="stat-label">repos</span>
              </div>
              <div className="stat">
                <span className="stat-num">UNDEFINED</span>
                <span className="stat-label">3AM ambitious builds</span>
              </div>
              <div className="stat">
                <span className="stat-num">OVERFLOW</span>
                <span className="stat-label">Ideas</span>
              </div>
            </div>
            <div className="hero-cta">
              <a href="https://github.com/arjunpawar2007ap-arch" className="btn-primary" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="#projects" className="btn-secondary">
                view work ↓
              </a>
            </div>
          </div>
          <div className="hero-ascii">
            <TelemetryDashboard />
          </div>
        </div>
      </section>

      <section className="section" id="projects">
        <p className="section-eyebrow">&gt; ls ./projects</p>
        <h2 className="section-title">What I've Built</h2>
        <div className="projects-grid">
          {PROJECTS.map((p) => (
            <a href={p.link} target="_blank" rel="noreferrer" className="project-card" key={p.name}>
              <div className="project-tag">{p.tag}</div>
              <h3 className="project-name">{p.name}</h3>
              <p className="project-desc">{p.desc}</p>
              <span className="project-link">view repo →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="section" id="experience">
        <p className="section-eyebrow">&gt; cat ./experience.log</p>
        <h2 className="section-title">Experience</h2>
        <div className="exp-list">
          {EXPERIENCE.map((e) => (
            <div className="exp-item" key={e.role + e.org}>
              <div className="exp-left">
                <span className="exp-period">{e.period}</span>
              </div>
              <div className="exp-right">
                <h3 className="exp-role">{e.role}</h3>
                <p className="exp-org">{e.org}</p>
                <p className="exp-detail">{e.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="contact">
        <p className="section-eyebrow">&gt; ping arjun</p>
        <h2 className="section-title">Contact</h2>
        <p className="contact-sub">Find me on the internet or drop a message.</p>
        <div className="contact-links">
          <a href="https://github.com/arjunpawar2007ap-arch" target="_blank" rel="noreferrer" className="contact-link">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/arjun-pawar-959177277/" target="_blank" rel="noreferrer" className="contact-link">
            LinkedIn
          </a>
          <a href="mailto:25b2286@iitb.ac.in" className="contact-link">
            Email
          </a>
        </div>
      </section>

      <footer className="footer">
        <span>ARJUN PAWAR</span>
      </footer>
    </div>
  );
}
