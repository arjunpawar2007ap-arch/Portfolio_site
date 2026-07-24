import { useEffect, useRef, useState } from "react";
import "./App.css";

function TelemetryDashboard() {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState("GITHUB");

  // GitHub Stats
  const [ghStats, setGhStats] = useState({
    repos: 20,
    followers: 1,
    status: "ONLINE",
  });
  const [commitHistory, setCommitHistory] = useState([]);

  // LeetCode Stats
  const [lcStats, setLcStats] = useState({
    solved: 80,
    easy: 35,
    medium: 40,
    hard: 5,
    ranking: "ACTIVE",
  });
  const [contestHistory, setContestHistory] = useState([]);

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
    .catch((err) => console.warn("GitHub stats fetch issue:", err));

  // 2. Fetch EXACT Contribution Graph Data (Last 90 Days)
  fetch("https://github-contributions-api.jogruber.de/v4/arjunpawar2007ap-arch?y=last")
    .then((res) => res.json())
    .then((data) => {
      if (data && data.contributions) {
        // Grab the last 90 days directly from the profile contribution calendar
        const last90Days = data.contributions.slice(-90).map((day) => day.count);
        setCommitHistory(last90Days);
      }
    })
    .catch((err) => console.warn("Contributions API fetch issue:", err));

    // 3. Fetch LeetCode Solved & Contest Stats
    fetch("https://leetcode-stats.tashif.codes/napoleonictrafficcone08")
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
      .catch((err) => console.warn("LeetCode stats fetch issue:", err));

    // Fetch LeetCode Contest / Submission History from proxy
    fetch("https://alfa-leetcode-api.onrender.com/napoleonictrafficcone08/contest")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.contestRankingHistory && data.contestRankingHistory.length > 0) {
          const ratings = data.contestRankingHistory
            .filter((c) => c.attended)
            .map((c) => Math.round(c.rating));
          if (ratings.length > 0) setContestHistory(ratings);
        }
      })
      .catch((err) => console.warn("LeetCode contest fetch issue:", err));
  }, []);

  // Custom Chart Canvas Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

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
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    if (activeTab === "GITHUB") {
      // --- Render 90-Day Commit Bar Histogram ---
      const data = commitHistory.length > 0 
        ? commitHistory 
        : [0,1,0,2,0,0,3,1,0,4,2,0,1,0,0,2,5,1,0,2,0,1,3,0,1,2,0,4,1,0,0,2,1,3,0,2,0,1,0,2,4,1,0,2,1,0,3,0,1,2,0,0,1,2,0,3,1,0,2,1,0,0,2,3,1,0,1,2,0,4,1,0,2,1,0,3,2,1,0,1,2,0,3,1,2,0,1,4];
      
      const padding = 12;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      const maxVal = Math.max(...data, 4);
      const barGap = 1.5;
      const barWidth = (chartWidth - barGap * (data.length - 1)) / data.length;

      data.forEach((val, i) => {
        const x = padding + i * (barWidth + barGap);
        const barH = val > 0 ? Math.max((val / maxVal) * chartHeight, 4) : 2;
        const y = height - padding - barH;

        ctx.fillStyle = val > 0 ? "#00ffb4" : "rgba(0, 255, 180, 0.15)";
        ctx.fillRect(x, y, barWidth, barH);
      });
    } else {
      // --- Render LeetCode Rating / Progress Curve ---
      const ratings = contestHistory.length > 0 
        ? contestHistory 
        : [1500, 1520, 1510, 1545, 1580, 1570, 1610, 1635, 1620, 1660, 1690, 1720];

      const padding = 16;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      const minR = Math.min(...ratings) - 20;
      const maxR = Math.max(...ratings) + 20;

      // Draw Gradient Area under Line
      const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradient.addColorStop(0, "rgba(0, 200, 255, 0.35)");
      gradient.addColorStop(1, "rgba(0, 200, 255, 0.0)");

      ctx.beginPath();
      ratings.forEach((val, i) => {
        const x = padding + (i / (ratings.length - 1)) * chartWidth;
        const y = height - padding - ((val - minR) / (maxR - minR)) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      // Close path for area fill
      ctx.lineTo(padding + chartWidth, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw Stroke Line
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#00c8ff";
      ratings.forEach((val, i) => {
        const x = padding + (i / (ratings.length - 1)) * chartWidth;
        const y = height - padding - ((val - minR) / (maxR - minR)) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Point Highlights
      ratings.forEach((val, i) => {
        const x = padding + (i / (ratings.length - 1)) * chartWidth;
        const y = height - padding - ((val - minR) / (maxR - minR)) * chartHeight;
        ctx.fillStyle = "#00c8ff";
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [activeTab, commitHistory, contestHistory]);

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
            <span>{activeTab === "GITHUB" ? "90-DAY COMMITS" : "CONTEST RATING"}</span>
            <span>STATUS: LIVE</span>
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
      ctx.strokeStyle = "rgba(0, 255, 180, 0.22)";
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
