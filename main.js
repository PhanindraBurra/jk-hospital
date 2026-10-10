import confetti from 'canvas-confetti';

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. INTRO STETHOSCOPE ANIMATION & PROGRESS COUNTER
     ========================================================================== */
  const introLoader = document.getElementById('intro-loader');
  const skipIntroBtn = document.getElementById('skip-intro-btn');
  const loaderProgress = document.getElementById('loader-progress');

  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      setTimeout(() => {
        finishIntro();
      }, 500);
    }
    if (loaderProgress) {
      loaderProgress.textContent = `${progress}%`;
    }
  }, 150);

  function finishIntro() {
    if (introLoader) {
      introLoader.classList.add('fade-out');
    }
  }

  if (skipIntroBtn) {
    skipIntroBtn.addEventListener('click', () => {
      clearInterval(progressInterval);
      finishIntro();
    });
  }

  /* ==========================================================================
     2. HERO HEARTBEAT ECG CANVAS ANIMATION
     ========================================================================== */
  const canvas = document.getElementById('hero-ecg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.offsetWidth || 500);
    let height = (canvas.height = canvas.offsetHeight || 70);

    window.addEventListener('resize', () => {
      width = canvas.width = canvas.offsetWidth || 500;
      height = canvas.height = canvas.offsetHeight || 70;
    });

    let x = 0;
    const points = [];

    function animateECG() {
      ctx.fillStyle = 'rgba(12, 23, 46, 0.2)';
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.strokeStyle = '#00d084';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00d084';

      let y = height / 2;
      const cycle = x % 120;

      if (cycle > 40 && cycle < 46) y -= 15; // P wave
      else if (cycle >= 46 && cycle < 50) y += 5;
      else if (cycle >= 50 && cycle < 54) y -= 35; // QRS peak
      else if (cycle >= 54 && cycle < 60) y += 25;
      else if (cycle >= 75 && cycle < 88) y -= 12; // T wave

      points.push({ x, y });

      if (points.length > width / 2) {
        points.shift();
      }

      for (let i = 0; i < points.length - 1; i++) {
        const pt1 = points[i];
        const pt2 = points[i + 1];
        ctx.moveTo(pt1.x % width, pt1.y);
        ctx.lineTo(pt2.x % width, pt2.y);
      }

      ctx.stroke();
      x += 3;
      requestAnimationFrame(animateECG);
    }

    animateECG();
  }

  /* ==========================================================================
     3. STETHOSCOPE AUDIO SYNTHESIZER (WEB AUDIO API)
     ========================================================================== */
  const soundBtns = document.querySelectorAll('.btn-sound');
  const soundStatusDisplay = document.getElementById('sound-status-display');
  let audioCtx = null;

  soundBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-sound');
      playStethoscopeSound(type);
    });
  });

  function playStethoscopeSound(type) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (type === 'normal') {
        soundStatusDisplay.textContent = '🔊 Playing Normal Lub-Dub Heart & Breath Rhythm...';
        // Synthesize Lub-Dub double pulse sound
        playHeartPulse(audioCtx, 0);
        playHeartPulse(audioCtx, 0.25);
        playHeartPulse(audioCtx, 0.9);
        playHeartPulse(audioCtx, 1.15);
      } else if (type === 'wheeze') {
        soundStatusDisplay.textContent = '🔊 Playing Wheezing Sound (Asthma/Pulmonology Indicator)...';
        playHeartPulse(audioCtx, 0);
        playWheezeTone(audioCtx, 0.1);
        playHeartPulse(audioCtx, 0.9);
        playWheezeTone(audioCtx, 1.0);
      }
    } catch (e) {
      soundStatusDisplay.textContent = 'Audio simulation active.';
    }
  }

  function playHeartPulse(ctx, startTime) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, ctx.currentTime + startTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + startTime + 0.15);

    gain.gain.setValueAtTime(0.6, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + 0.15);
  }

  function playWheezeTone(ctx, startTime) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime + startTime);
    osc.frequency.linearRampToValueAtTime(520, ctx.currentTime + startTime + 0.4);

    gain.gain.setValueAtTime(0.2, ctx.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + startTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + 0.4);
  }

  /* ==========================================================================
     4. STETHOSCOPE HEALTH & SYMPTOM EVALUATOR LOGIC
     ========================================================================== */
  const symptomChips = document.querySelectorAll('.symptom-chip');
  const resultPlaceholder = document.getElementById('result-placeholder');
  const resultContent = document.getElementById('result-content');
  const recBadge = document.getElementById('recommended-dept-badge');
  const recTitle = document.getElementById('recommendation-title');
  const recDesc = document.getElementById('recommendation-desc');
  const recDocImg = document.getElementById('rec-doc-img');
  const recDocName = document.getElementById('rec-doc-name');
  const recDocRole = document.getElementById('rec-doc-role');
  const btnBookFromEval = document.getElementById('btn-book-from-eval');

  let selectedDepartment = null;

  const deptData = {
    'pulmonology': {
      badge: 'PULMONOLOGY & RESPIRATORY SPECIALTY',
      title: 'Recommended Specialty: Pulmonology & Asthma Care',
      desc: 'Our Pulmonology unit led by Dr. N. Lokeswara Reddy evaluates asthma, COPD, and lung conditions with advanced PFT diagnostic testing.',
      docImg: '/images/dr-lokeswara-reddy.png',
      docName: 'Dr. N. Lokeswara Reddy',
      docRole: 'Chief Pulmonologist & MD Medicine'
    },
    'general-surgery': {
      badge: 'GENERAL & LAPAROSCOPIC SURGERY',
      title: 'Recommended Specialty: General Surgery',
      desc: 'Our surgical department offers comprehensive pre- & post-operative care for acute abdominal pain, hernia, and surgical conditions.',
      docImg: '/images/dr-tnn.png',
      docName: 'Senior General Surgeon',
      docRole: 'M.S. General Surgery & Laparoscopy'
    },
    'laparoscopy': {
      badge: 'MINIMALLY INVASIVE LAPAROSCOPY',
      title: 'Recommended Specialty: Laparoscopic Surgery',
      desc: 'Minimally invasive keyhole surgical repair for gallbladder, appendicitis, and abdominal discomfort with minimal pain.',
      docImg: '/images/dr-tnn.png',
      docName: 'Senior Laparoscopic Surgeon',
      docRole: 'FMAS Specialist Laparoscopist'
    },
    'general-medicine': {
      badge: 'GENERAL MEDICINE & PREVENTIVE CARE',
      title: 'Recommended Specialty: General Medicine',
      desc: 'Thorough clinical evaluations, preventive health check-ups, and management of chronic fever, BP, and metabolic conditions.',
      docImg: '/images/dr-lokeswara-reddy.png',
      docName: 'Dr. N. Lokeswara Reddy',
      docRole: 'M.D. General Medicine'
    },
    'emergency': {
      badge: '🚨 24/7 CRITICAL EMERGENCY CARE',
      title: 'Recommended Specialty: 24/7 Emergency & ICU',
      desc: 'Immediate emergency stabilization, cardiac resuscitation, and 24/7 trauma unit intervention.',
      docImg: '/images/dr-venn.png',
      docName: 'Emergency Duty Physician',
      docRole: 'Critical Care & Emergency Specialist'
    }
  };

  symptomChips.forEach(chip => {
    chip.addEventListener('click', () => {
      symptomChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');

      const deptKey = chip.getAttribute('data-dept');
      selectedDepartment = deptKey;

      if (deptData[deptKey]) {
        const info = deptData[deptKey];
        recBadge.textContent = info.badge;
        recTitle.textContent = info.title;
        recDesc.textContent = info.desc;
        recDocImg.src = info.docImg;
        recDocName.textContent = info.docName;
        recDocRole.textContent = info.docRole;

        resultPlaceholder.classList.add('hidden');
        resultContent.classList.remove('hidden');
      }
    });
  });

  if (btnBookFromEval) {
    btnBookFromEval.addEventListener('click', () => {
      openAppointmentModal(selectedDepartment ? selectedDepartment.replace('-', ' ') : 'Pulmonology');
    });
  }

  /* ==========================================================================
     5. APPOINTMENT MODAL & CONFETTI SYSTEM
     ========================================================================== */
  const appModal = document.getElementById('appointment-modal');
  const openAppBtn = document.getElementById('open-appointment-btn');
  const heroBookBtn = document.getElementById('hero-book-btn');
  const aboutAppointBtn = document.getElementById('about-appoint-btn');
  const closeAppModalBtn = document.getElementById('close-modal-btn');
  const appForm = document.getElementById('appointment-form');
  const appDeptSelect = document.getElementById('app-dept');
  const bookDocBtns = document.querySelectorAll('.book-doc-btn');
  const slotBtns = document.querySelectorAll('.slot-btn');

  let selectedSlotTime = '10:00 AM';

  function openAppointmentModal(prefDept = '') {
    if (appModal) {
      appModal.classList.add('open');
      document.body.style.overflow = 'hidden';

      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateInput = document.getElementById('app-date');
      if (dateInput) {
        dateInput.value = tomorrow.toISOString().split('T')[0];
      }

      if (prefDept && appDeptSelect) {
        for (let i = 0; i < appDeptSelect.options.length; i++) {
          if (appDeptSelect.options[i].text.toLowerCase().includes(prefDept.toLowerCase())) {
            appDeptSelect.selectedIndex = i;
            break;
          }
        }
      }
    }
  }

  function closeAppointmentModal() {
    if (appModal) {
      appModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (openAppBtn) openAppBtn.addEventListener('click', () => openAppointmentModal());
  if (heroBookBtn) heroBookBtn.addEventListener('click', () => openAppointmentModal());
  if (aboutAppointBtn) aboutAppointBtn.addEventListener('click', () => openAppointmentModal());
  if (closeAppModalBtn) closeAppModalBtn.addEventListener('click', closeAppointmentModal);

  bookDocBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const docName = btn.getAttribute('data-doc');
      openAppointmentModal(docName);
    });
  });

  slotBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      slotBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSlotTime = btn.getAttribute('data-slot');
    });
  });

  if (appForm) {
    appForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const patientName = document.getElementById('app-name').value;
      const phone = document.getElementById('app-phone').value;
      const dept = appDeptSelect.value;
      const date = document.getElementById('app-date').value;

      // Launch celebration confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Show confirmation alert & reset
      alert(`🎉 Appointment Successfully Reserved!\n\nPatient Name: ${patientName}\nPhone: ${phone}\nSpeciality: ${dept}\nDate: ${date} at ${selectedSlotTime}\nLocation: JK Hospital, Tangirala Vari St, Tanuku.\n\nOur reception desk (+91 99489 54848) will call you shortly to confirm!`);

      appForm.reset();
      closeAppointmentModal();
    });
  }

  /* ==========================================================================
     6. DEPARTMENT DETAILS MODAL SYSTEM
     ========================================================================== */
  const deptModal = document.getElementById('dept-detail-modal');
  const closeDeptModalBtn = document.getElementById('close-dept-modal-btn');
  const deptModalBody = document.getElementById('dept-modal-body');
  const deptDetailBtns = document.querySelectorAll('.btn-dept-details');

  const fullDeptDetails = {
    'general-medicine': {
      title: 'General Medicine Department',
      subtitle: 'Comprehensive Internal Medicine & Preventive Care',
      content: `
        <p>The General Medicine department at JK Hospital Tanuku provides high-level diagnostic & therapeutic care for adult health conditions. Under the leadership of <strong>Dr. N. Lokeswara Reddy</strong>, we specialize in:</p>
        <ul style="margin: 15px 0 20px 20px; line-height: 1.8;">
          <li>Routine & Executive Health Checkups</li>
          <li>Management of Diabetes, Hypertension & Metabolic Disorders</li>
          <li>Infectious Disease Diagnosis & Fever Management</li>
          <li>Geriatric Care & Chronic Disease Rehabilitation</li>
        </ul>
        <div style="background:#F0F7FF; padding:15px; border-radius:10px; margin-bottom:20px;">
          <strong>Consulting Doctor:</strong> Dr. N. Lokeswara Reddy (M.D. General Medicine)<br/>
          <strong>OPD Timings:</strong> 9:00 AM - 8:30 PM (Mon - Sat)
        </div>
      `
    },
    'general-surgery': {
      title: 'General Surgery Department',
      subtitle: 'Safe, Precision Surgical Care & Trauma Operations',
      content: `
        <p>Our General Surgery team delivers high-precision surgical care using advanced aseptic operation suites. Treatments include:</p>
        <ul style="margin: 15px 0 20px 20px; line-height: 1.8;">
          <li>Emergency Trauma & Soft Tissue Surgeries</li>
          <li>Gastrointestinal & Abdominal Interventions</li>
          <li>Abscess, Cyst & Tumor Excision</li>
          <li>Post-Operative Recovery & Wound Management</li>
        </ul>
      `
    },
    'pulmonology': {
      title: 'Pulmonology & Respiratory Specialty Center',
      subtitle: 'Advanced Asthma, COPD, PFT Diagnostic & Lung Care',
      content: `
        <p>JK Hospital is renowned across Tanuku for specialized Pulmonology services. We offer state-of-the-art chest & respiratory treatment:</p>
        <ul style="margin: 15px 0 20px 20px; line-height: 1.8;">
          <li><strong>Pulmonary Function Test (PFT):</strong> Complete lung capacity & airway resistance evaluation.</li>
          <li><strong>Asthma & COPD Management:</strong> Inhalation therapy, nebulization, & long-term care plans.</li>
          <li><strong>Bronchitis, Pneumonia & Tuberculosis:</strong> Targeted antimicrobial & therapeutic management.</li>
          <li><strong>ICU Ventilator Support:</strong> Critical care for acute respiratory distress.</li>
        </ul>
      `
    },
    'laparoscopy': {
      title: 'Laparoscopic Surgery Unit',
      subtitle: 'Minimally Invasive Keyhole Procedures',
      content: `
        <p>Laparoscopy allows complex abdominal surgeries through tiny incisions, leading to minimal pain, minimal scarring, and quick return to work.</p>
        <ul style="margin: 15px 0 20px 20px; line-height: 1.8;">
          <li>Laparoscopic Cholecystectomy (Gallbladder Removal)</li>
          <li>Laparoscopic Appendectomy (Appendix Repair)</li>
          <li>Hernia Repair (Inguinal & Ventral Hernias)</li>
          <li>Diagnostic Laparoscopy & Gynecological Surgeries</li>
        </ul>
      `
    },
    'emergency': {
      title: '24/7 Emergency & Casualty Response',
      subtitle: 'Round-the-Clock Critical Care & Ambulance',
      content: `
        <p>Our emergency department is fully active 24 hours a day, 7 days a week for accident trauma, acute respiratory distress, and medical emergencies.</p>
        <p style="margin-top:10px;"><strong>Emergency Hotline:</strong> <a href="tel:+919948954848" style="color:#EF4444; font-weight:bold;">+91 99489 54848</a> / <a href="tel:+919966446679" style="color:#EF4444; font-weight:bold;">+91 99664 46679</a></p>
      `
    }
  };

  deptDetailBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const deptKey = btn.getAttribute('data-dept');
      if (fullDeptDetails[deptKey]) {
        const info = fullDeptDetails[deptKey];
        deptModalBody.innerHTML = `
          <div class="modal-header">
            <span class="modal-icon">🏥</span>
            <div>
              <h2>${info.title}</h2>
              <p>${info.subtitle}</p>
            </div>
          </div>
          <div class="modal-content-body">
            ${info.content}
          </div>
          <div style="margin-top:25px;">
            <button class="btn btn-primary btn-block modal-dept-book-btn">📅 Book Appointment in ${info.title}</button>
          </div>
        `;
        deptModal.classList.add('open');
        document.body.style.overflow = 'hidden';

        const modalBookBtn = deptModalBody.querySelector('.modal-dept-book-btn');
        if (modalBookBtn) {
          modalBookBtn.addEventListener('click', () => {
            deptModal.classList.remove('open');
            openAppointmentModal(info.title);
          });
        }
      }
    });
  });

  if (closeDeptModalBtn) {
    closeDeptModalBtn.addEventListener('click', () => {
      deptModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  /* ==========================================================================
     7. CONTACT FORM SUBMISSION
     ========================================================================== */
  const contactForm = document.getElementById('contact-quick-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('c-name').value;
      const phone = document.getElementById('c-phone').value;
      alert(`Thank you ${name}! Your inquiry has been received. Our team at JK Hospital Tanuku will contact you at ${phone} shortly.`);
      contactForm.reset();
    });
  }

  /* ==========================================================================
     8. MOBILE HAMBURGER MENU
     ========================================================================== */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  /* ==========================================================================
     9. HEADER STICKY & SCROLL EFFECTS
     ========================================================================== */
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

});
