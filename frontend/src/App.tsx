import React, { useState, useEffect, useRef } from 'react';
import Antigravity from './components/Antigravity';
import SplitText from './components/SplitText';
import TextType from './components/TextType';
import DecryptedText from './components/DecryptedText';
import ScrollVelocity from './components/ScrollVelocity';
import './style.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ICONS = {
  upload: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  mail: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  sun: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zM4.22 4.22a1 1 0 0 1 1.41 0l.71.71a1 1 0 1 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zm13.44 13.44a1 1 0 0 1 1.41 0l.71.71a1 1 0 1 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zM2 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1zm16 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1zM4.22 19.78a1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1-1.41 0zM17.66 6.34a1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1-1.41 0zM12 6a6 6 0 1 0 0 12A6 6 0 0 0 12 6z"/></svg>,
  moon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  file: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  send: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  alert: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  spark: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
};

type ToastType = 'success' | 'error' | 'info';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [page, setPage] = useState<'main' | 'profile'>('main');
  const [authed, setAuthed] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: ToastType }[]>([]);
  const [loading, setLoading] = useState<{ active: boolean; title: string; sub: string }>({ active: false, title: '', sub: '' });
  
  // States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [dropHover, setDropHover] = useState(false);
  const [resumeDropHover, setResumeDropHover] = useState(false);
  const [ocrText, setOcrText] = useState(() => localStorage.getItem('mc-ocr') || '');
  const [prompt, setPrompt] = useState(() => localStorage.getItem('mc-prompt') || '');
  const [ocrStatus, setOcrStatus] = useState('');
  const [genStatus, setGenStatus] = useState('');
  const [ocrBoxVisible, setOcrBoxVisible] = useState(() => !!localStorage.getItem('mc-ocr'));
  
  // Output states
  const [hasOutput, setHasOutput] = useState(() => localStorage.getItem('mc-hasOutput') === 'true');
  const [hrEmail, setHrEmail] = useState(() => localStorage.getItem('mc-hrEmail') || '');
  const [company, setCompany] = useState(() => localStorage.getItem('mc-company') || '');
  const [role, setRole] = useState(() => localStorage.getItem('mc-role') || '');
  const [jobDesc, setJobDesc] = useState(() => localStorage.getItem('mc-jobDesc') || '');
  const [subject, setSubject] = useState(() => localStorage.getItem('mc-subject') || '');
  const [body, setBody] = useState(() => localStorage.getItem('mc-body') || '');
  const [resumeAttached, setResumeAttached] = useState(() => localStorage.getItem('mc-resumeAttached') === 'true');
  const [resumeName, setResumeName] = useState(() => localStorage.getItem('mc-resumeName') || '');
  const [gmailUrl, setGmailUrl] = useState(() => localStorage.getItem('mc-gmailUrl') || '');

  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Persistence Effect
  useEffect(() => {
    // localStorage.setItem('mc-preview', imagePreview); // REMOVE THIS: blob URLs are not stable across refreshes
    localStorage.setItem('mc-ocr', ocrText);
    localStorage.setItem('mc-prompt', prompt);
    localStorage.setItem('mc-hasOutput', hasOutput.toString());
    localStorage.setItem('mc-hrEmail', hrEmail);
    localStorage.setItem('mc-company', company);
    localStorage.setItem('mc-role', role);
    localStorage.setItem('mc-jobDesc', jobDesc);
    localStorage.setItem('mc-subject', subject);
    localStorage.setItem('mc-body', body);
    localStorage.setItem('mc-resumeAttached', resumeAttached.toString());
    localStorage.setItem('mc-resumeName', resumeName);
    localStorage.setItem('mc-gmailUrl', gmailUrl);
  }, [imagePreview, ocrText, prompt, hasOutput, hrEmail, company, role, jobDesc, subject, body, resumeAttached, resumeName, gmailUrl]);
  
  // Profile
  const [profile, setProfile] = useState<any>(null);
  const [pName, setPName] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pPortfolio, setPPortfolio] = useState('');
  const [pEdu, setPEdu] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillIn, setSkillIn] = useState('');
  const [pendingResume, setPendingResume] = useState<File | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  
  const outputRef = useRef<HTMLDivElement>(null);
  
  let toastIdCounter = useRef(0);

  // Auto-scroll on generation
  useEffect(() => {
    if (hasOutput && outputRef.current) {
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [hasOutput]);

  const addToast = (msg: string, type: ToastType = 'info') => {
    const id = ++toastIdCounter.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const checkAuth = async () => {
    try {
      const r = await fetch(API + '/auth/status');
      const d = await r.json();
      setAuthed(d.success && d.data.isAuthenticated);
      setUserEmail(d.data.userEmail || '');
    } catch {
      setAuthed(false);
      setUserEmail('');
    }
  };

  const loadProfileProps = async () => {
    setIsFetchingProfile(true);
    try {
      const r = await fetch(API + '/user-profile');
      const d = await r.json();
      if (d.success) {
        setProfile(d.data);
        syncProfile(d.data);
      }
    } catch {}
    setIsFetchingProfile(false);
  };

  const syncProfile = (p: any) => {
    setPName(p.name || '');
    setPEmail(p.email || '');
    setPPhone(p.phone || '');
    setPPortfolio(p.portfolioLink || '');
    setPEdu(p.education || '');
    setSkills(Array.isArray(p.skills) ? p.skills : []);
    setPendingResume(null);
  };

  const startResizing = () => {
    // Feature removed
  };

  useEffect(() => {
    const t = localStorage.getItem('mc-theme') as 'dark' | 'light';
    if (t) {
      setTheme(t);
      document.documentElement.setAttribute('data-theme', t);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Auth Return handling for popups
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');

    if (authStatus === 'success') {
      // If we are in a popup, tell the parent to refresh and then close
      if (window.opener) {
        window.opener.postMessage('auth-success', window.location.origin);
        window.close();
      } else {
        setAuthed(true);
        addToast('Gmail connected successfully.', 'success');
        window.history.replaceState({}, '', window.location.pathname);
        checkAuth();
      }
    } else if (authStatus === 'error') {
       if (window.opener) {
         window.opener.postMessage('auth-error', window.location.origin);
         window.close();
       } else {
         addToast('Gmail connection error.', 'error');
         window.history.replaceState({}, '', window.location.pathname);
       }
    }

    // Listener for messages from the popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data === 'auth-success') {
        checkAuth();
        addToast('Gmail connected successfully.', 'success');
      } else if (event.data === 'auth-error') {
        addToast('Gmail connection error.', 'error');
      }
    };
    checkAuth();
    loadProfileProps();

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mc-theme', next);
  };

  const handleConnectGmail = async () => {
    setLoading({ active: true, title: 'Connecting Gmail', sub: 'Initializing Google OAuth…' });
    try {
      const r = await fetch(API + '/auth/google');
      const d = await r.json();
      if (!d.success) throw new Error(d.error);
      
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        // On mobile, just open a new tab directly for better compatibility
        window.open(d.data.authUrl, '_blank');
      } else {
        // On desktop, use a centered popup window
        const w = 520; const h = 620;
        const left = (window.screen.width / 2) - (w / 2);
        const top = (window.screen.height / 2) - (h / 2);
        window.open(d.data.authUrl, 'googleAuth', `width=${w},height=${h},top=${top},left=${left}`);
      }
      
      addToast('Please complete the sign-in. This page will update automatically.', 'info');
      
      // Poll a few times just in case postMessage is blocked
      setTimeout(checkAuth, 3000);
      setTimeout(checkAuth, 8000);
    } catch (err: any) {
      addToast(err.message, 'error');
    }
    setLoading({ active: false, title: '', sub: '' });
  };

  const handleLogoutGmail = () => {
    setShowDisconnectModal(true);
  };
  
  const confirmLogoutGmail = async () => {
    setShowDisconnectModal(false);
    await fetch(API + '/auth/logout', { method: 'POST' });
    setAuthed(false);
    
    // Total Clean Slate on manual disconnect
    setImagePreview('');
    setOcrText('');
    setPrompt('');
    setHasOutput(false);
    setHrEmail('');
    setCompany('');
    setRole('');
    setJobDesc('');
    setSubject('');
    setBody('');
    setGmailUrl('');
    setOcrBoxVisible(false);
    
    addToast('Logged out and all session data cleared.', 'info');
  };

  useEffect(() => {
    // Debounced analysis removed
  }, [prompt]);

  // --- Main Handlers ---
  const handleImageFile = async (f: File) => {
    if (!f.type.startsWith('image/')) {
      addToast('Only image files are accepted.', 'error');
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    setOcrStatus('Converting photo to text…');
    try {
      const fd = new FormData(); fd.append('image', f);
      const r = await fetch(API + '/upload-image', { method: 'POST', body: fd });
      const d = await r.json();
      if (!d.success) throw new Error(d.error);
      
      const cleanText = d.data.extractedText;
      setOcrText(cleanText);
      // Automatically put the cleaned text into the prompt area
      setPrompt(prev => prev ? prev + '\n\n' + cleanText : cleanText);
      
      setOcrStatus('');
      setOcrBoxVisible(true);
      addToast('Photo converted to text. You can edit it now.', 'success');
    } catch (e: any) {
      setOcrStatus('');
      addToast(e.message || 'Conversion failed', 'error');
    }
  };

  const handleParseAndGen = async () => {
    if (!ocrText) return;
    setGenStatus('Analysing job details…');
    try {
      const r = await fetch(API + '/extract-details', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ocrText })
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error);
      
      setHrEmail(d.data.hr_email || '');
      setCompany(d.data.company || '');
      setRole(d.data.role || '');
      setJobDesc(d.data.job_description || ocrText);
      
      await handleGenerateEmail(d.data.company, d.data.role, d.data.job_description || ocrText, d.data.hr_email);
    } catch (e: any) {
      addToast(e.message, 'error');
      setGenStatus('');
    }
  };

  const handleGenFromPrompt = async () => {
    if (!prompt || prompt.length < 6) return;
    setGenStatus('Generating email…');
    try {
      const r = await fetch(API + '/extract-details', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt })
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error);
      
      setHrEmail(d.data.hr_email || '');
      setCompany(d.data.company || '');
      setRole(d.data.role || '');
      setJobDesc(d.data.job_description || prompt);
      
      await handleGenerateEmail(d.data.company, d.data.role, d.data.job_description || prompt, d.data.hr_email);
    } catch (e: any) {
      addToast(e.message, 'error');
      setGenStatus('');
    }
  };

  const handleAnalyzeJob = async (text: string) => {
    // Feature removed
  };

  const handleGenerateEmail = async (comp: string, rol: string, desc: string, hrM: string) => {
    setGenStatus('AI is writing your email…');
    try {
      const r = await fetch(API + '/generate-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: comp || 'the company', role: rol || 'the position', jobDescription: desc, hrEmail: hrM })
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error);
      setSubject(d.data.subject);
      setBody(d.data.body);
      setResumeAttached(d.data.resumeAttached);
      setResumeName(d.data.resumeName);
      setHasOutput(true);
      setGenStatus('');
      
      addToast('Email generated. Review it and send to draft when ready.', 'success');
    } catch (e: any) {
      setGenStatus('');
      addToast(e.message, 'error');
    }
  };

  const handleRegen = async () => {
     if (company || role) await handleGenerateEmail(company, role, jobDesc, hrEmail);
  };

  const handleSendDraft = async () => {
    if (!authed) { handleConnectGmail(); return; }
    if (!hrEmail) { addToast('Recipient (To) field is required.', 'error'); return; }
    if (!subject) { addToast('Subject is required.', 'error'); return; }
    if (!body) { addToast('Email body cannot be empty.', 'error'); return; }

    setLoading({ active: true, title: 'Creating Gmail draft', sub: 'Sending with resume attachment…' });
    try {
      const r = await fetch(API + '/create-draft', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: hrEmail, subject, body, company, role, jobDescription: jobDesc })
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error);
      setGmailUrl(d.data.gmailUrl);
      addToast('Draft saved to Gmail.', 'success');
    } catch (e: any) {
      const msg = e.message;
      if (msg.includes('auth') || msg.includes('token') || msg.includes('grant')) {
        setAuthed(false);
        addToast('Gmail session expired. Please reconnect.', 'error');
      } else {
        addToast(msg, 'error');
      }
    }
    setLoading({ active: false, title: '', sub: '' });
  };

  const handleNewChat = () => {
    setImagePreview('');
    setOcrText('');
    setPrompt('');
    setOcrBoxVisible(false);
    setHasOutput(false);
    setHrEmail('');
    setCompany('');
    setRole('');
    setJobDesc('');
    setSubject('');
    setBody('');
    setResumeAttached(false);
    setResumeName('');
    setGmailUrl('');
  };

  // --- Profile Handlers ---
  const handleSaveProfile = async () => {
    if (!pName) { addToast('Name is required.', 'error'); return; }
    if (!pEmail) { addToast('Email is required.', 'error'); return; }

    setIsSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append('name', pName);
      fd.append('email', pEmail);
      fd.append('phone', pPhone);
      fd.append('portfolioLink', pPortfolio);
      fd.append('education', pEdu);
      skills.forEach(s => fd.append('skills', s));
      if (pendingResume) fd.append('resume', pendingResume);

      const r = await fetch(API + '/user-profile', { method: 'POST', body: fd });
      const d = await r.json();
      if (!d.success) throw new Error(d.error);
      
      setProfile(d.data);
      setSkills(Array.isArray(d.data.skills) ? d.data.skills : []);
      setPendingResume(null);
      addToast('Profile saved.', 'success');
      
      loadProfileProps();
    } catch (e: any) {
      addToast(e.message, 'error');
    }
    setIsSavingProfile(false);
  };

  const handleResumeSelect = (f: File) => {
    if (f.type !== 'application/pdf') {
      addToast('Only PDF files are accepted.', 'error');
      return;
    }
    setIsUploadingResume(true);
    setTimeout(() => {
      setPendingResume(f);
      setIsUploadingResume(false);
      addToast('Resume scanned and ready.', 'success');
    }, 1500); // Fake upload delay for visual experience
  };

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'auto', opacity: 0.35, mixBlendMode: 'screen' }}>
        <Antigravity
          count={300}
          magnetRadius={6}
          ringRadius={7}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={1.5}
          lerpSpeed={0.05}
          color={theme === 'dark' ? '#22d3ee' : '#0891b2'}
          autoAnimate={true}
          particleVariance={1}
        />
      </div>

      <div id="app" style={{ position: 'relative', zIndex: 10 }}>
        <nav className="nav">
          <div className="nav-brand">
            <span className="nav-brand-text"><DecryptedText text="MailCraft" animateOn="hover" style={{ fontWeight: 'bold' }} /></span>
            <span className="nav-brand-dot">.</span>
          </div>
          <div className="nav-center">
            <button className={`nav-tab ${page === 'main' ? 'active' : ''}`} onClick={() => setPage('main')}>Generate</button>
            <button className={`nav-tab ${page === 'profile' ? 'active' : ''}`} onClick={() => setPage('profile')}>Profile</button>
          </div>
          <div className="nav-right">
            <button className="theme-toggle" onClick={handleToggleTheme} title="Toggle theme">
              {theme === 'dark' ? ICONS.sun : ICONS.moon}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <button className={`gmail-badge ${authed ? 'active' : ''}`} onClick={authed ? handleLogoutGmail : handleConnectGmail}>
                <span className="dot"></span> {authed ? 'Gmail Connected' : 'Connect Gmail'}
              </button>
              {authed && userEmail && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, opacity: 0.8, marginRight: '4px' }}>
                  {userEmail}
                </span>
              )}
            </div>
          </div>
        </nav>

        {page === 'main' && (
          <div className="workspace">
            <div className="pane pane-left">
              <div className="pane-head">
                <span className="pane-title"><SplitText text="Input" /></span>
              </div>

              <div className="prompt-container">
                <label className="field-label" htmlFor="prompt-ta">Job details</label>
                <div className="prompt-block">
                  {imagePreview && (
                    <div className="prompt-image-preview">
                      <img src={imagePreview} alt="Job details" />
                      <button className="prompt-image-clear" onClick={() => { setImagePreview(''); setImageFile(null); setOcrText(''); setOcrBoxVisible(false); }}>&times;</button>
                      {ocrStatus && <div className="prompt-image-status">{ocrStatus}</div>}
                    </div>
                  )}
                  <textarea
                    className="prompt-inner"
                    id="prompt-ta"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Paste job details or upload a screenshot. E.g. Apply for React Dev at Netflix, hr@netflix.com. AI extracts everything automatically."
                  ></textarea>
                  <div className="prompt-footer">
                    <div className="prompt-footer-left">
                       <button className="btn btn-ghost btn-icon" title="Scan Image/Screenshot" onClick={() => (document.getElementById('hidden-file-input') as HTMLInputElement)?.click()}>
                         {ICONS.plus}
                       </button>
                       <input 
                         type="file" 
                         id="hidden-file-input" 
                         className="hidden" 
                         accept="image/*" 
                         onChange={(e) => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); }} 
                       />
                    </div>
                    <button className="btn btn-primary" onClick={handleGenFromPrompt} disabled={prompt.length < 6 && !ocrText}>
                      {ICONS.spark} Generate
                    </button>
                  </div>
                </div>
              </div>

              {ocrBoxVisible && (
                <div className="ocr-box" style={{ display: 'block', marginTop: '1rem' }}>
                  <div className="ocr-box-head">
                    <span>Detected Job Info</span>
                    <button className="btn btn-accent btn-sm" onClick={handleParseAndGen} style={{ textTransform: 'none', letterSpacing: 0 }}>
                      {ICONS.spark} Generate Email
                    </button>
                  </div>
                  <div className="ocr-text">{ocrText.slice(0, 500) + (ocrText.length > 500 ? '…' : '')}</div>
                </div>
              )}

            </div>

            <div className="pane pane-right" ref={outputRef}>
              <div className="pane-head">
                <span className="pane-title"><SplitText text="Generated Email" /></span>
                {hasOutput && <button className="btn btn-ghost btn-sm" onClick={handleRegen}>{ICONS.refresh} Regenerate</button>}
              </div>

              <div className={`email-card ${hasOutput || genStatus ? 'lit' : ''}`}>
                {genStatus ? (
                  <div className="email-fields fadein" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem', opacity: 0.8 }}>
                     <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>{genStatus}</span>
                     <div className="skeleton skeleton-input"></div>
                     <div className="skeleton skeleton-input"></div>
                     <div className="skeleton skeleton-box"></div>
                  </div>
                ) : !hasOutput ? (
                  <div className="email-empty">
                    <div className="email-empty-icon">{ICONS.mail}</div>
                    <h3>No email yet</h3>
                    <p><TextType strings={['Upload a screenshot or describe the job on the left, then hit Generate.']} typingSpeed={40} cursor={false} loop={false} pauseDuration={100000} /></p>
                  </div>
                ) : (
                  <>
                    <div className="email-fields fadein" style={{ display: 'flex' }}>
                      <div className="email-row">
                        <span className="email-row-label">To</span>
                        <input className="email-row-input" type="email" value={hrEmail} onChange={e => setHrEmail(e.target.value)} placeholder="Recipient email" />
                      </div>
                      <div className="email-row">
                        <span className="email-row-label">Subject</span>
                        <input className="email-row-input" type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject line" />
                      </div>
                    </div>
                    <div className="email-body-wrap">
                      <textarea className="email-body-ta fadein" style={{ display: 'block' }} value={body} onChange={e => setBody(e.target.value)} ></textarea>
                    </div>
                  </>
                )}
              </div>

              {hasOutput && (
                <div className="action-strip show">
                  <div>
                     {resumeAttached ? 
                       <div className="file-badge has-resume">{ICONS.check} {resumeName}</div> :
                       <div className="file-badge no-resume">{ICONS.alert} No resume — add in Profile</div>
                     }
                  </div>
                  <div className="action-strip-btns" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                     {authed ? 
                       <button className="btn btn-success" onClick={handleSendDraft}>{ICONS.send} Send to Draft</button> :
                       <button className="btn btn-secondary btn-sm" onClick={handleConnectGmail}>Connect Gmail to send</button>
                     }
                  </div>
                </div>
              )}

              {gmailUrl && (
                <div className="success-bar show">
                  <div className="success-bar-info">
                    <span className="success-bar-title">Draft saved to Gmail</span>
                    <span className="success-bar-desc">Draft sent to "{hrEmail}" is waiting in Gmail Drafts.</span>
                  </div>
                  <a className="btn btn-success" href={gmailUrl} target="_blank" rel="noopener">Open Gmail</a>
                </div>
              )}
            </div>
          </div>
        )}

        {page === 'profile' && (
          <div className="profile-page on">
            <div className="profile-inner">
              <div className="profile-head">
                <h2><DecryptedText text="Profile" revealMode="sequential" /></h2>
                <p>Used to personalise every generated email.</p>
              </div>

              <div className="card">
                <div className="card-head">
                  <div className="card-head-icon">{ICONS.user}</div>
                  <h3>Personal Information</h3>
                </div>
                <div className="card-body">
                  {isFetchingProfile ? (
                    <div className="grid-2 fadein">
                      <div className="skeleton skeleton-input"></div>
                      <div className="skeleton skeleton-input"></div>
                      <div className="skeleton skeleton-input"></div>
                      <div className="skeleton skeleton-input"></div>
                    </div>
                  ) : (
                    <div className="grid-2">
                      <div className="form-row">
                      <label className="field-label">Full name *</label>
                      <input className="field-input" type="text" value={pName} onChange={e => setPName(e.target.value)} placeholder="Your full name" />
                    </div>
                    <div className="form-row">
                      <label className="field-label">Email address *</label>
                      <input className="field-input" type="email" value={pEmail} onChange={e => setPEmail(e.target.value)} placeholder="you@email.com" />
                    </div>
                    <div className="form-row">
                      <label className="field-label">Phone</label>
                      <input className="field-input" type="tel" value={pPhone} onChange={e => setPPhone(e.target.value)} placeholder="+91 99999 88888" />
                    </div>
                    <div className="form-row">
                      <label className="field-label">Portfolio / LinkedIn</label>
                      <input className="field-input" type="url" value={pPortfolio} onChange={e => setPPortfolio(e.target.value)} placeholder="https://…" />
                    </div>
                    <div className="form-row full">
                      <label className="field-label">Education</label>
                      <input className="field-input" type="text" value={pEdu} onChange={e => setPEdu(e.target.value)} placeholder="e.g. MCA graduate" />
                    </div>
                    <div className="form-row full">
                      <label className="field-label">Skills <small style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: 'var(--text-muted)' }}>(Enter or comma to add)</small></label>
                      <div className="skills-wrap" onClick={(e) => { if ((e.target as any).tagName !== 'BUTTON') document.getElementById('skIn')?.focus(); }}>
                        {skills.map(sk => (
                          <span className="skill-chip" key={sk}>{sk}<button type="button" onClick={() => setSkills(skills.filter(s => s !== sk))}>×</button></span>
                        ))}
                        <input 
                           id="skIn" className="skill-in" placeholder="Type a skill…" 
                           value={skillIn} onChange={e => setSkillIn(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter' || e.key === ',') {
                               e.preventDefault();
                               const val = skillIn.replace(',', '').trim();
                               if (val && !skills.includes(val)) {
                                 setSkills([...skills, val]);
                               }
                               setSkillIn('');
                             } else if (e.key === 'Backspace' && !skillIn && skills.length) {
                               setSkills(skills.slice(0, -1));
                             }
                           }}
                           onBlur={() => {
                             const val = skillIn.replace(',', '').trim();
                             if (val && !skills.includes(val)) setSkills([...skills, val]);
                             setSkillIn('');
                           }}
                        />
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <div className="card-head-icon">{ICONS.file}</div>
                  <h3>Resume</h3>
                </div>
                <div className="card-body">
                  <div 
                    className={`resume-drop ${resumeDropHover ? 'over' : ''} ${isUploadingResume ? 'uploading' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setResumeDropHover(true); }}
                    onDragLeave={() => setResumeDropHover(false)}
                    onDrop={(e) => { 
                      e.preventDefault(); setResumeDropHover(false); 
                      const f = e.dataTransfer.files[0];
                      if (f && !isUploadingResume) handleResumeSelect(f);
                    }}
                  >
                    <input type="file" accept=".pdf" disabled={isUploadingResume} onChange={(e) => { if (e.target.files?.[0]) handleResumeSelect(e.target.files[0]); }} />
                    <p style={{ color: pendingResume || profile?.resumeOriginalName ? 'var(--success-text)' : 'inherit', fontSize: '0.84rem' }}>
                       {isUploadingResume 
                         ? 'Uploading and analyzing document…' 
                         : (pendingResume ? pendingResume.name : (profile?.resumeOriginalName || 'PDF only · up to 10 MB · click or drag'))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="profile-footer">
                <button className="btn btn-ghost" disabled={isSavingProfile} onClick={() => { if(profile){syncProfile(profile); addToast('Reset to saved values.', 'info');} }}>Reset</button>
                {isSavingProfile ? (
                  <button className="btn btn-primary btn-lg skeleton" disabled></button>
                ) : (
                  <button className="btn btn-primary btn-lg" onClick={handleSaveProfile}>Save profile</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Scroll Velocity Background / Footer effect */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', pointerEvents: 'none', zIndex: 5, opacity: 0.03 }}>
          <ScrollVelocity 
             texts={['MailCraft', 'Automate Your Job Applications', 'AI Email Generation', 'Grok 3 API']} 
             className="scroll-vel"
             velocity={3} 
             velocityFactor={0.5} 
          />
      </div>

      <div className="toasts">
         {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
               <span className="toast-dot"></span>
               <span>{t.msg}</span>
            </div>
         ))}
      </div>

      <div className={`overlay ${loading.active ? 'on' : ''}`}>
        <div className="overlay-ring"></div>
        <span className="overlay-title">{loading.title}</span>
        <span className="overlay-sub">{loading.sub}</span>
      </div>

      {showDisconnectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-head">
               <div className="modal-icon">{ICONS.alert}</div>
               <h3>Disconnect Gmail?</h3>
            </div>
            <p>Are you sure you want to log out of your Google account? You'll need to re-authenticate to send future applications.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowDisconnectModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: 'var(--warn-text)' }} onClick={confirmLogoutGmail}>Disconnect</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
