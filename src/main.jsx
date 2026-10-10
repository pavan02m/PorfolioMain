import React, { Suspense, lazy, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Github, Sun, Moon,
  Download, MapPin, Mail, Linkedin, Menu, X, Copy, Check, Code2, Database,
  BrainCircuit, Layers3, ExternalLink, GraduationCap, BriefcaseBusiness,
  Coffee, Heart, Sparkles, Filter, Send, Terminal, FileText
} from 'lucide-react'
import './styles.css'
import './interactive.css'
import { useSmoothScroll, getLenis } from './hooks/useSmoothScroll'
import { useInteractions } from './hooks/useInteractions'
import { supports3D } from './lib/supports3D'
import Marquee from './components/Marquee'

// three.js is only downloaded when the hero is rendered, and only if the browser can run WebGL.
const DevCharacter3D = lazy(() => import('./components/DevCharacter3D'))

const skills = [
  { name: 'Java', group: 'Backend', mark: '☕' },
  { name: 'Spring Boot', group: 'Backend', mark: '🌱' },
  { name: 'Microservices', group: 'Backend', mark: '◇' },
  { name: 'Kafka', group: 'Backend', mark: '⌘' },
  { name: 'REST APIs', group: 'Backend', mark: '↔' },
  { name: 'React', group: 'Frontend', mark: '⚛' },
  { name: 'JavaScript', group: 'Frontend', mark: 'JS' },
  { name: 'Next.js', group: 'Frontend', mark: 'N' },
  { name: 'Tailwind CSS', group: 'Frontend', mark: '≈' },
  { name: 'PostgreSQL', group: 'Data & Cloud', mark: '🐘' },
  { name: 'Azure', group: 'Data & Cloud', mark: '△' },
  { name: 'Docker', group: 'Data & Cloud', mark: '▤' },
  { name: 'Pinecone', group: 'AI & Tools', mark: '✳' },
  { name: 'Git', group: 'AI & Tools', mark: '⑂' },
  { name: 'Python', group: 'AI & Tools', mark: 'Py' },
]

const projects = [
  {
    number: '01',
    title: 'AI Code Review Platform',
    category: 'AI / Full stack',
    description: 'An AI-powered code review platform that uses repository context to generate useful pull-request feedback, walkthroughs, and improvement suggestions.',
    stack: ['Next.js', 'AI SDK', 'Pinecone', 'Gemini AI'],
    tone: 'lavender',
    icon: 'AI',
    visual: 'review',
    details: 'Designed around repository indexing and retrieval-augmented generation so reviews can use relevant project context rather than isolated code snippets.',
    link: 'https://github.com/pavanmetkari'
  },
  {
    number: '02',
    title: 'Logistics Route Optimizer',
    category: 'Backend / Data',
    description: 'A logistics concept that turns shipment tracking information into concise route summaries and useful operational insights.',
    stack: ['Spring Boot', 'Python', 'React', 'Data viz'],
    tone: 'mint',
    icon: '↗',
    visual: 'route',
    details: 'Focuses on turning complex shipment events into a clearer summary for teams that need to understand a route and its potential issues quickly.',
    link: 'https://github.com/pavanmetkari'
  },
  {
    number: '03',
    title: 'Code Visualizer',
    category: 'Developer tools',
    description: 'A learning-focused interface for stepping through code and understanding recursion, data structures, and execution flow.',
    stack: ['React', 'JavaScript', 'Tailwind'],
    tone: 'yellow',
    icon: '{ }',
    visual: 'nodes',
    details: 'The goal is to make abstract execution easier to follow with clear visual states and approachable explanations.',
    link: 'https://github.com/pavanmetkari'
  },
  {
    number: '04',
    title: 'Data Visualization Dashboard',
    category: 'Frontend / Data',
    description: 'An interactive dashboard concept for exploring complex datasets through filters, charts, and visual summaries.',
    stack: ['React', 'D3.js', 'Supabase'],
    tone: 'blue',
    icon: '▥',
    visual: 'chart',
    details: 'A responsive data-first layout with multiple views designed to help users spot patterns without getting lost in the details.',
    link: 'https://github.com/pavanmetkari'
  },
]

const filters = ['All', 'Backend', 'Frontend', 'AI / Full stack', 'Developer tools']


function SketchCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)
  const [pressed, setPressed] = useState(false)
  React.useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reducedMotion) return
    const move = (event) => {
      setPosition({ x: event.clientX, y: event.clientY })
      setVisible(true)
    }
    const leave = () => setVisible(false)
    const down = () => setPressed(true)
    const up = () => setPressed(false)
    window.addEventListener('mousemove', move)
    document.addEventListener('mouseleave', leave)
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseleave', leave)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
    }
  }, [])
  return (
      <div
          className={`sketch-cursor ${visible ? 'is-visible' : ''} ${pressed ? 'is-pressed' : ''}`}
          style={{ left: position.x, top: position.y }}
          aria-hidden="true"
      >
        <svg className="cursor-pencil" width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <path d="M2 2 L8 3 L31 26 L26 31 Z" fill="#f4d56b" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/>
          <path d="M2 2 L4.5 9.5 L9.5 4.5 Z" fill="#d4b7a0" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
          <path d="M2 2 L4.5 9.5 L9.5 4.5" fill="none" stroke="#30283a" strokeWidth="1"/>
          <path d="M8 3 L31 26" stroke="#fff6d9" strokeWidth="1.3"/>
          <path d="M26 31 L31 26 L32 32 Z" fill="#d99c84" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
        </svg>
        <span className="cursor-spark">✳</span>
      </div>
  )
}

function useScrollReveal() {
  React.useEffect(() => {
    const SELECTOR = '.reveal, .reveal-item, .reveal-card'
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canObserve = 'IntersectionObserver' in window

    const observer = canObserve && !reducedMotion
        ? new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          })
        }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' })
        : null

    // Reveal each item independently; section wrappers must not hide their children.
    const watch = (element, index = 0) => {
      if (element.classList.contains('revealed')) return
      if (!observer) { element.classList.add('revealed'); return }
      element.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 75}ms`)
      observer.observe(element)
    }

    document.querySelectorAll(SELECTOR).forEach(watch)

    // Elements rendered later (e.g. project cards coming back after a filter change) are new DOM nodes,
    // so they have to be picked up here too or they would stay invisible.
    const mutations = new MutationObserver((records) => {
      let index = 0
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return
        if (node.matches(SELECTOR)) watch(node, index++)
        node.querySelectorAll(SELECTOR).forEach((child) => watch(child, index++))
      }))
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => { mutations.disconnect(); observer?.disconnect() }
  }, [])
}

function PortraitIllustration() {
  return (
      <div className="workspace-frame" aria-label="Illustrated miniature developer workspace">
        <div className="workspace-depth-shadow" />
        <div className="tape tape-top" />
        <div className="workspace-scene">
          <div className="workspace-sun" />
          <div className="workspace-wall-note">make it useful <span>✳</span></div>
          <div className="desk-lamp"><i /></div>
          <div className="workspace-plant"><i /><i /><i /><b /></div>
          <div className="desk">
            <div className="laptop">
              <div className="laptop-screen">
                <div className="screen-bar"><i /><i /><i /><span>hello_world.java</span></div>
                <div className="screen-code">
                  <span><b>01</b> public class <em>Hello</em> {'{'}</span>
                  <span><b>02</b> &nbsp; void build() {'{'}</span>
                  <span><b>03</b> &nbsp;&nbsp; learn();</span>
                  <span><b>04</b> &nbsp;&nbsp; repeat();</span>
                  <span><b>05</b> &nbsp; {'}'}</span>
                  <span><b>06</b> {'}'}</span>
                </div>
              </div>
              <div className="laptop-base" />
            </div>
            <div className="coffee-cup"><i /></div>
            <div className="notebook"><span>little ideas</span><i /></div>
            <div className="pencil-on-desk" />
          </div>
          <div className="workspace-floor" />
          <span className="workspace-caption">a little corner of the internet</span>
        </div>
        <div className="workspace-label">Pavan's workspace <span>✳</span></div>
        <div className="workspace-sticker">code<br/>☕<br/>repeat</div>
      </div>
  )
}

function HeroScene() {
  const ok = useMemo(() => supports3D(), [])
  return ok
      ? <Suspense fallback={<PortraitIllustration/>}><DevCharacter3D/></Suspense>
      : <PortraitIllustration/>
}

function ProjectVisual({ type }) {
  return (
      <div className={`project-visual visual-${type}`} aria-hidden="true">
        <div className="visual-top"><i /><i /><i /><span>{type === 'review' ? 'pull-request.review' : type === 'route' ? 'route / overview' : type === 'nodes' ? 'execution.map' : 'insights.dashboard'}</span></div>
        {type === 'review' && <div className="code-preview"><aside><b>⌂</b><b>⑂</b><b>◫</b><b>⚙</b></aside><div className="code-lines">{Array.from({length:7},(_,i)=><i key={i} style={{width:`${45+(i*13)%48}%`}} />)}<div className="review-chip">✓ review complete</div></div></div>}
        {type === 'route' && <div className="map-preview"><div className="map-road road-a"/><div className="map-road road-b"/><div className="map-road road-c"/><span className="pin pin-a"/><span className="pin pin-b"/><span className="pin pin-c"/><div className="route-card">ETA <b>02h 40m</b><small>route optimized</small></div></div>}
        {type === 'nodes' && <div className="node-preview"><span className="node n1">main()</span><span className="node n2">call()</span><span className="node n3">return</span><span className="node n4">result</span><i className="edge e1"/><i className="edge e2"/><i className="edge e3"/></div>}
        {type === 'chart' && <div className="chart-preview"><div className="chart-sidebar"/><div className="chart-content"><div className="chart-stats"><i/><i/><i/></div><div className="bars">{[34,62,45,82,55,70,91,47,67,38,76,58].map((h,i)=><i key={i} style={{height:`${h}%`}} />)}</div><div className="chart-footer"><i/><i/><i/></div></div></div>}
      </div>
  )
}

function App() {
  useSmoothScroll()
  useInteractions()
  useScrollReveal()
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [filter, setFilter] = useState('All')
  const [activeProject, setActiveProject] = useState(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const visibleProjects = useMemo(() => filter === 'All' ? projects : projects.filter(p => p.category === filter || p.category.includes(filter)), [filter])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('pavanmetkari@gmail.com')
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = 'mailto:pavanmetkari@gmail.com'
    }
  }

  React.useEffect(() => {
    const lenis = getLenis()
    if (!lenis) return
    if (activeProject) lenis.stop(); else lenis.start()
  }, [activeProject])

  React.useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)
  const scrollTo = (id) => {
    const target = document.getElementById(id)
    const lenis = getLenis()
    if (lenis && target) lenis.scrollTo(target, { offset: -88, duration: 1.4 })
    else target?.scrollIntoView({ behavior: 'smooth' })
    closeMenu()
  }
  const submitContact = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Portfolio hello from ${form.name}`)
    const body = encodeURIComponent(`Hi Pavan,\n\n${form.message}\n\nFrom: ${form.name}\nEmail: ${form.email}`)
    window.location.href = `mailto:pavanmetkari@gmail.com?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
      <main className={dark ? 'site dark' : 'site'}>
        <SketchCursor />
        <div className="scroll-progress" aria-hidden="true" />
        <div className="paper-grain" />
        <header className="nav shell">
          <a className="wordmark" href="#home" aria-label="Pavan home">Pavan<span>.</span></a>
          <button className="mobile-menu icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="main-nav">{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
          {menuOpen && <div className="menu-scrim" onClick={closeMenu} aria-hidden="true" />}
          <nav id="main-nav" className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
            <a href="#home" onClick={closeMenu}>01. Home</a>
            <a href="#about" onClick={closeMenu}>02. About</a>
            <a href="#skills" onClick={closeMenu}>03. Skills</a>
            <a href="#projects" onClick={closeMenu}>04. Projects</a>
            <a href="#experience" onClick={closeMenu}>05. Experience</a>
            <a href="#contact" onClick={closeMenu}>06. Contact</a>
            <button type="button" className="menu-theme" onClick={() => setDark(!dark)} role="switch" aria-checked={dark}>
              <span className="menu-theme-label">{dark ? <Moon size={19}/> : <Sun size={19}/>} {dark ? 'Dark mode' : 'Light mode'}</span>
              <span className="menu-switch" aria-hidden="true"/>
            </button>
          </nav>
          <div className="nav-actions">
            <a className="resume-button" href="/Pavan-Metkari-Resume.pdf" download>Resume <Download size={14}/></a>
            <button className="icon-button theme-toggle" onClick={() => setDark(!dark)} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>{dark ? <Moon size={20}/> : <Sun size={20}/>}</button>
          </div>
        </header>

        <section
            className="hero shell section-paper"
            id="home"
            onMouseMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect()
              const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
              const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
              event.currentTarget.style.setProperty('--pointer-x', x.toFixed(3))
              event.currentTarget.style.setProperty('--pointer-y', y.toFixed(3))
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.setProperty('--pointer-x', '0')
              event.currentTarget.style.setProperty('--pointer-y', '0')
            }}
        >
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot"/> SOFTWARE DEVELOPER <span className="eyebrow-line"/></div>
            <h1>Turning ideas<br/>into <span className="highlight">real products.</span></h1>
            <p className="intro">I'm Pavan Metkari, a Software Developer at TCS. I build scalable backend systems and modern web applications. I enjoy solving real-world problems, learning new technologies, and creating products that make an impact.</p>
            <div className="hero-actions">
              <button className="button button-dark" onClick={() => scrollTo('projects')}>View My Work <ArrowRight size={17}/></button>
              <a className="button button-outline" href="https://github.com/pavanmetkari" target="_blank" rel="noreferrer"><Github size={19}/> GitHub <ExternalLink className="external" size={13}/></a>
            </div>
            <div className="small-note"><ArrowDownRight size={17}/> Scroll down to explore</div>
            <div className="hero-footnote"><Sparkles size={15}/> Build · Explore · Repeat</div>
          </div>
          <div className="hero-art">
            <div className="margin-note"><span>Tech</span><span>Gaming</span><span>Riding</span><span>Learning</span><i>...</i></div>
            <HeroScene/>
            <svg className="arrow-doodle" viewBox="0 0 90 70" aria-hidden="true"><path d="M7 59 C12 24, 42 11, 72 17 M58 5 L73 17 L59 28" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div className="mini-mountains" aria-hidden="true"><svg viewBox="0 0 120 65"><path d="M4 58 L34 16 L48 36 L65 5 L113 58 M21 58 L43 39 L56 58 M66 58 L83 34 L104 58" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M29 23 L34 29 L39 22 M60 14 L65 20 L71 13" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></div>
            <div className="location-tag"><MapPin size={15}/> Currently at TCS <span>· Mumbai, India</span></div>
            <div className="sparkle sparkle-a">✳</div><div className="sparkle sparkle-b">✦</div>
          </div>
        </section>

        <Marquee />

        <section className="section shell reveal" id="about">
          <div className="section-heading"><div><span className="section-number">02 / ABOUT</span><h2>A bit about me<span className="period">.</span></h2></div><span className="heading-doodle">a curious mind, always <u>building</u> ↗</span></div>
          <div className="about-grid">
            <div className="about-main reveal-item">
              <p className="about-lead">I like turning complicated problems into simple, useful software.</p>
              <p>I'm a software developer with experience building backend services, APIs, and modern web applications. My day-to-day work has introduced me to enterprise systems, while my personal projects let me explore AI, developer tools, and product ideas end to end.</p>
              <p>I care about readable code, thoughtful user experiences, and understanding why a system works—not just getting it to run.</p>
            </div>
            <aside className="quick-facts reveal-item">
              <div className="paperclip">⌁</div><h3>Quick facts</h3>
              <ul><li><ArrowRight size={15}/> Backend-leaning developer</li><li><ArrowRight size={15}/> Always learning</li><li><ArrowRight size={15}/> Interested in AI & systems</li><li><ArrowRight size={15}/> Tech, gaming & riding</li><li><Coffee size={15}/> Coffee powered</li></ul>
              <span className="note-smile">“Build things that are useful.” ☺</span>
            </aside>
          </div>
        </section>

        <section className="section shell reveal" id="skills">
          <div className="section-heading"><div><span className="section-number">03 / SKILLS</span><h2>Tools I work with<span className="period">.</span></h2></div><span className="heading-doodle">a growing toolbox ✳</span></div>
          <div className="skill-groups">
            {[
              {name:'Backend',icon:<Layers3 size={18}/>,desc:'Services, APIs & distributed systems'},
              {name:'Frontend',icon:<Code2 size={18}/>,desc:'Interfaces that feel good to use'},
              {name:'Data & Cloud',icon:<Database size={18}/>,desc:'Data stores and cloud foundations'},
              {name:'AI & Tools',icon:<BrainCircuit size={18}/>,desc:'Experiments, retrieval and workflow'}
            ].map(group => <div className="skill-group reveal-card" key={group.name}><div className="skill-group-head">{group.icon}<div><h3>{group.name}</h3><p>{group.desc}</p></div></div><div className="skill-pills">{skills.filter(s=>s.group===group.name).map(skill=><span className="skill-pill" key={skill.name}><i>{skill.mark}</i>{skill.name}</span>)}</div></div>)}
          </div>
        </section>

        <section className="section shell reveal" id="projects">
          <div className="section-heading projects-heading"><div><span className="section-number">04 / PROJECTS</span><h2>Some things I've built<span className="period">.</span></h2></div><span className="heading-doodle">little ideas, real effort ↗</span></div>
          <div className="filter-row" aria-label="Filter projects"><span><Filter size={15}/> Browse by type</span>{filters.map(f=><button key={f} className={filter===f?'filter active':'filter'} onClick={()=>setFilter(f)}>{f}</button>)}</div>
          <div className="project-grid">
            {visibleProjects.map(project=><article className="project-card reveal-card" key={project.number}>
              <div className="project-card-top"><span>{project.number} / {project.category}</span><span className={`project-sticker ${project.tone}`}>{project.icon}</span></div>
              <ProjectVisual type={project.visual}/>
              <div className="project-body"><h3>{project.title}</h3><p>{project.description}</p><div className="project-tags">{project.stack.map(tag=><span key={tag}>{tag}</span>)}</div>
                <div className="project-actions"><button className="text-link" onClick={()=>setActiveProject(project)}>Read case study <ArrowUpRight size={15}/></button><a className="github-square" href={project.link} target="_blank" rel="noreferrer" aria-label={`GitHub for ${project.title}`}><Github size={17}/></a></div>
              </div>
            </article>)}
          </div>
          <p className="project-footnote">Project links currently point to your GitHub profile—replace them with each repository or live demo when ready.</p>
        </section>

        <section className="section shell reveal" id="experience">
          <div className="section-heading"><div><span className="section-number">05 / EXPERIENCE</span><h2>My journey so far<span className="period">.</span></h2></div><span className="heading-doodle">learning by doing ↗</span></div>
          <div className="timeline">
            <article className="timeline-item reveal-card"><div className="timeline-marker">TCS</div><div className="timeline-content reveal-item"><div className="timeline-title"><div><h3>Software Developer</h3><p>Tata Consultancy Services</p></div><span>Oct 2024 — Present</span></div><ul><li>Contributing to an Insurance Institute of India project in the insurance domain.</li><li>Working with Java, Spring Boot, backend services, and database technologies.</li><li>Collaborating on analysis, implementation, testing, and delivery of technical changes.</li></ul><div className="timeline-tags"><span>Java</span><span>Spring Boot</span><span>APIs</span><span>SQL</span></div></div></article>
            <article className="timeline-item reveal-card"><div className="timeline-marker"><GraduationCap size={21}/></div><div className="timeline-content reveal-item"><div className="timeline-title"><div><h3>B.E. Information Technology</h3><p>Vidyalankar Institute of Technology</p></div><span>2020 — 2024</span></div><p>Graduated with a CGPA of 9.67, building a strong foundation in software development and computer science.</p></div></article>
            <article className="timeline-item reveal-card"><div className="timeline-marker"><Heart size={19}/></div><div className="timeline-content reveal-item"><div className="timeline-title"><div><h3>Technical Head — IEEE Student Chapter</h3><p>Student leadership & technical events</p></div><span>2022 — 2024</span></div><p>Led a team of 13 members and helped organize technical activities and events.</p></div></article>
          </div>
          <div className="experience-note">Still learning, still shipping, still asking “what if?” <span>☺</span></div>
        </section>

        <section className="section shell contact-section reveal" id="contact">
          <div className="contact-intro reveal-item"><span className="section-number">06 / CONTACT</span><h2>Let's build something<br/>great<span className="period">.</span></h2><p>I'm open to discussing developer opportunities, interesting projects, and ideas worth building—or just having a good conversation about tech.</p><div className="contact-doodle">drop me a line <span>↘</span></div></div>
          <div className="contact-content reveal-item">
            <div className="contact-links">
              <a href="mailto:pavanmetkari@gmail.com" className="contact-link"><span className="contact-icon"><Mail size={20}/></span><span><small>Email</small><b>pavanmetkari@gmail.com</b></span><ArrowUpRight size={16}/></a>
              <a href="https://linkedin.com/in/pavan-metkari" target="_blank" rel="noreferrer" className="contact-link"><span className="contact-icon linkedin">in</span><span><small>LinkedIn</small><b>Connect with me</b></span><ArrowUpRight size={16}/></a>
              <a href="https://github.com/pavanmetkari" target="_blank" rel="noreferrer" className="contact-link"><span className="contact-icon"><Github size={20}/></span><span><small>GitHub</small><b>See what I'm building</b></span><ArrowUpRight size={16}/></a>
              <div className="contact-link location-link"><span className="contact-icon"><MapPin size={20}/></span><span><small>Based in</small><b>Mumbai, India</b></span></div>
            </div>
            <form className="contact-form" onSubmit={submitContact}>
              <h3>Send a little note <span>✉</span></h3>
              <label>Your name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="What should I call you?"/></label>
              <label>Your email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label>
              <label>Your message<textarea required rows="3" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Tell me what's on your mind..."/></label>
              <button className="button button-dark" type="submit">{sent ? 'Opening your email app…' : 'Send message'} <Send size={15}/></button>
              <p className="form-note">This opens your email app with the message filled in—no data is stored here.</p>
            </form>
          </div>
        </section>

        <footer className="footer shell"><a className="wordmark" href="#home">Pavan<span>.</span></a><p>Made with curiosity, coffee, and a little paper texture.</p><button className="copy-email" onClick={copyEmail}>{copied?<Check size={14}/>:<Copy size={14}/>} {copied?'Copied!':'Copy email'}</button><a className="back-top" href="#home">Back to top ↑</a></footer>

        {activeProject && <div className="modal-backdrop" role="presentation" onClick={()=>setActiveProject(null)}><section className="project-modal" data-lenis-prevent role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e=>e.stopPropagation()}><button className="modal-close icon-button" onClick={()=>setActiveProject(null)} aria-label="Close project details"><X size={19}/></button><span className="section-number">{activeProject.number} / CASE STUDY</span><h2 id="modal-title">{activeProject.title}</h2><ProjectVisual type={activeProject.visual}/><p>{activeProject.description}</p><p>{activeProject.details}</p><div className="project-tags">{activeProject.stack.map(tag=><span key={tag}>{tag}</span>)}</div><a className="button button-dark modal-github" href={activeProject.link} target="_blank" rel="noreferrer"><Github size={17}/> Visit GitHub <ArrowUpRight size={15}/></a></section></div>}
      </main>
  )
}

createRoot(document.getElementById('root')).render(<App/>)