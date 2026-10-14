/**
 * Adarsh Vidya Mandir Soorsagar - Admit Card Portal Logic
 * Interactive Search, Verification Card, Admit Card Rendering & Print/PDF Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const searchForm = document.getElementById('searchForm');
  const rollInput = document.getElementById('rollInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const btnSearch = document.getElementById('btnSearch');
  const errorAlert = document.getElementById('errorAlert');
  const errorTitle = document.getElementById('errorTitle');
  const errorMsg = document.getElementById('errorMsg');
  
  // Verification Card Elements
  const studentDetailsCard = document.getElementById('studentDetailsCard');
  const verifiedPhoto = document.getElementById('verifiedPhoto');
  const verifiedName = document.getElementById('verifiedName');
  const verifiedFather = document.getElementById('verifiedFather');
  const verifiedClass = document.getElementById('verifiedClass');
  const verifiedRoll = document.getElementById('verifiedRoll');
  const verifiedDob = document.getElementById('verifiedDob');
  const verifiedRollWords = document.getElementById('verifiedRollWords');
  const btnPrintCard = document.getElementById('btnPrintCard');
  const btnPrintCardBottom = document.getElementById('btnPrintCardBottom');
  const btnDownloadPdf = document.getElementById('btnDownloadPdf');
  const btnDownloadPdfBottom = document.getElementById('btnDownloadPdfBottom');
  const btnScrollPreview = document.getElementById('btnScrollPreview');

  // Admit Card Sheet Elements
  const admitCardSection = document.getElementById('admitCardSection');
  const admitCardPrintArea = document.getElementById('admitCardPrintArea');
  const cardPhoto = document.getElementById('cardPhoto');
  const cardName = document.getElementById('cardName');
  const cardFather = document.getElementById('cardFather');
  const cardRoll = document.getElementById('cardRoll');
  const cardClass = document.getElementById('cardClass');
  const cardRollWords = document.getElementById('cardRollWords');
  const cardDob = document.getElementById('cardDob');
  const scheduleTableBody = document.getElementById('scheduleTableBody');
  const welcomeGuide = document.getElementById('welcomeGuide');

  // Modals
  const rosterModal = document.getElementById('rosterModal');
  const btnOpenRoster = document.getElementById('btnOpenRoster');
  const btnCloseRoster = document.getElementById('btnCloseRoster');
  const btnCloseRosterFooter = document.getElementById('btnCloseRosterFooter');
  const classFilterSelect = document.getElementById('classFilterSelect');
  const nameFilterInput = document.getElementById('nameFilterInput');
  const rosterTableBody = document.getElementById('rosterTableBody');
  const rosterCount = document.getElementById('rosterCount');

  const helpModal = document.getElementById('helpModal');
  const btnOpenHelp = document.getElementById('btnOpenHelp');
  const btnCloseHelp = document.getElementById('btnCloseHelp');
  const btnCloseHelpFooter = document.getElementById('btnCloseHelpFooter');
  const loadingOverlay = document.getElementById('loadingOverlay');

  // State
  let currentStudent = null;

  // Class mapping to match Exam Schedule sheet
  const CLASS_MAPPING = {
    'FIRST': '1', '1ST': '1', '1': '1',
    'SECOND': '2', '2ND': '2', '2': '2',
    'THIRD': '3', '3RD': '3', '3': '3',
    'FOURTH': '4', '4TH': '4', '4': '4',
    'FIFTH': '5', '5TH': '5', '5': '5',
    'SIXTH': '6', '6TH': '6', '6': '6',
    'SEVENTH': '7', '7TH': '7', '7': '7',
    'EIGHTH': '8', '8TH': '8', '8': '8',
    'NINTH': '9', '9TH': '9', '9': '9',
    'TENTH': '10', '10TH': '10', '10': '10',
    'ELEVENTH': '11', '11TH': '11', '11': '11',
    'TWELFTH': '12', '12TH': '12', '12': '12',
    'PP3+': 'PP3+', 'PP4+': 'PP4+', 'PP5+': 'PP5+'
  };

  // Check if data is loaded
  if (typeof ADMIT_CARD_DATA === 'undefined' || !ADMIT_CARD_DATA.students) {
    showError('डाटा त्रुटि (Data Error)', 'विद्यार्थी डाटा लोड नहीं हो सका। कृपया पृष्ठ को पुनः लोड करें।');
    return;
  }

  const allStudents = Object.values(ADMIT_CARD_DATA.students);

  // ------------------------------------------------------------------
  // Search Functions
  // ------------------------------------------------------------------
  function handleSearch(rollToSearch) {
    const roll = (rollToSearch || rollInput.value).trim();
    if (!roll) {
      showError('रोल नंबर आवश्यक है', 'कृपया विद्यार्थी का रोल नंबर दर्ज करें (उदा. 1001, 1015 आदि)।');
      rollInput.focus();
      return;
    }

    const student = ADMIT_CARD_DATA.students[roll];
    if (!student) {
      showError(
        'रोल नंबर ' + roll + ' नहीं मिला',
        'कृपया रोल नंबर की जाँच करें (1001 से 1200) अथवा "नाम या कक्षा से खोजें" बटन पर क्लिक करके अपना रोल नंबर देखें।'
      );
      return;
    }

    // Found student!
    hideError();
    displayStudent(student);
  }

  function displayStudent(student) {
    currentStudent = student;
    rollInput.value = student.rollNo;
    btnClearSearch.style.display = 'flex';

    // 1. Populate Verification Card
    const photoPath = student.photo ? `admitcardphotos/${student.photo}` : 'placeholder.svg';
    verifiedPhoto.src = photoPath;
    verifiedPhoto.onerror = () => { verifiedPhoto.src = 'placeholder.svg'; };
    verifiedName.textContent = student.name || '—';
    verifiedFather.textContent = student.fatherName || '—';
    verifiedClass.textContent = student.class || '—';
    verifiedRoll.textContent = student.rollNo;
    verifiedDob.textContent = student.dob || '—';
    verifiedRollWords.textContent = student.rollWords || '—';

    // 2. Populate Admit Card Sheet (Exact match to sample PDF)
    cardPhoto.src = photoPath;
    cardPhoto.onerror = () => { cardPhoto.src = 'placeholder.svg'; };
    cardName.textContent = student.name || '';
    cardFather.textContent = student.fatherName || '';
    cardRoll.textContent = student.rollNo || '';
    cardClass.textContent = student.class || '';
    cardRollWords.textContent = student.rollWords || '';
    cardDob.textContent = student.dob || '';

    // 3. Populate Exam Schedule Table
    renderSchedule(student.class);

    // 4. Reveal sections
    studentDetailsCard.style.display = 'block';
    admitCardSection.style.display = 'block';
    if (welcomeGuide) welcomeGuide.style.display = 'none';

    // 5. Adjust mobile scaling if screen is narrow
    adjustMobileScale();

    // 6. Smooth scroll to verification card
    studentDetailsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function adjustMobileScale() {
    const wrap = document.querySelector('.admit-card-scroll-wrap');
    if (!wrap || !admitCardPrintArea) return;
    
    // Available container width
    const containerWidth = wrap.clientWidth || window.innerWidth;
    const baseWidth = 760;

    if (containerWidth < baseWidth + 8) {
      // Scale down neatly to fit mobile width with comfortable margin
      const targetWidth = Math.max(280, containerWidth - 12);
      const scale = targetWidth / baseWidth;

      admitCardPrintArea.style.transform = `scale(${scale})`;
      admitCardPrintArea.style.transformOrigin = 'top left';

      // Centering offset
      const scaledWidth = baseWidth * scale;
      const leftOffset = Math.max(0, (containerWidth - scaledWidth) / 2);
      admitCardPrintArea.style.marginLeft = `${leftOffset}px`;
      admitCardPrintArea.style.marginRight = '0px';

      // Wrap height to fit scaled card precisely without extra blank space
      const actualHeight = admitCardPrintArea.scrollHeight || 750;
      wrap.style.height = `${Math.ceil(actualHeight * scale) + 16}px`;
      wrap.style.overflow = 'hidden';
    } else {
      admitCardPrintArea.style.transform = 'none';
      admitCardPrintArea.style.transformOrigin = 'center top';
      admitCardPrintArea.style.marginLeft = 'auto';
      admitCardPrintArea.style.marginRight = 'auto';
      wrap.style.height = 'auto';
      wrap.style.overflow = 'visible';
    }
  }

  window.addEventListener('resize', adjustMobileScale);
  window.addEventListener('orientationchange', () => {
    setTimeout(adjustMobileScale, 150);
  });

  function renderSchedule(studentClass) {
    scheduleTableBody.innerHTML = '';
    const classKey = CLASS_MAPPING[(studentClass || '').toUpperCase()] || studentClass;
    const scheduleItems = ADMIT_CARD_DATA.schedules[classKey] || [];

    // The sample admit card has a 4-row split layout (Col 1-3: Sr, Date, Subject; Col 4-6: Sr, Date, Subject)
    const totalRows = Math.max(4, Math.ceil(scheduleItems.length / 2));

    for (let i = 0; i < totalRows; i++) {
      const leftItem = scheduleItems[i];
      const rightItem = scheduleItems[i + totalRows];

      const tr = document.createElement('tr');
      
      // Left columns
      const leftSr = leftItem ? leftItem.sr : '';
      const leftDate = leftItem ? leftItem.date : '';
      const leftSubj = leftItem ? leftItem.subject : '';

      // Right columns
      const rightSr = rightItem ? rightItem.sr : '';
      const rightDate = rightItem ? rightItem.date : '';
      const rightSubj = rightItem ? rightItem.subject : '';

      tr.innerHTML = `
        <td class="col-sr">${leftSr}</td>
        <td class="col-date">${leftDate}</td>
        <td class="col-subj">${leftSubj}</td>
        <td class="col-sr">${rightSr}</td>
        <td class="col-date">${rightDate}</td>
        <td class="col-subj">${rightSubj}</td>
      `;
      scheduleTableBody.appendChild(tr);
    }
  }

  function showError(title, msg) {
    errorTitle.textContent = title;
    errorMsg.textContent = msg;
    errorAlert.style.display = 'flex';
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  window.hideError = function() {
    errorAlert.style.display = 'none';
  };

  // ------------------------------------------------------------------
  // Event Listeners for Search & Input
  // ------------------------------------------------------------------
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSearch();
  });

  btnSearch.addEventListener('click', () => {
    handleSearch();
  });

  rollInput.addEventListener('input', () => {
    if (rollInput.value.trim().length > 0) {
      btnClearSearch.style.display = 'flex';
      hideError();
    } else {
      btnClearSearch.style.display = 'none';
    }
  });

  btnClearSearch.addEventListener('click', () => {
    rollInput.value = '';
    btnClearSearch.style.display = 'none';
    rollInput.focus();
  });

  // Quick Test Pills
  document.querySelectorAll('.quick-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const roll = pill.getAttribute('data-roll');
      rollInput.value = roll;
      handleSearch(roll);
    });
  });

  // ------------------------------------------------------------------
  // High-Fidelity Print & PDF Engine (Strict 1-Page A4 Output)
  // ------------------------------------------------------------------
  function triggerPrint() {
    if (!currentStudent) {
      showError('विद्यार्थी चुनें', 'कृपया पहले रोल नंबर खोजें।');
      return;
    }

    // Set document title so when saving as PDF, the filename defaults to Admit_Card_[roll]_[name].pdf
    const safeStudentName = (currentStudent.name || 'Student').replace(/\s+/g, '_');
    document.title = `Admit_Card_${currentStudent.rollNo}_${safeStudentName}`;

    // Reset inline transforms immediately before opening print/save dialog
    const wrap = document.querySelector('.admit-card-scroll-wrap');
    if (admitCardPrintArea) {
      admitCardPrintArea.style.transform = '';
      admitCardPrintArea.style.marginLeft = '';
      admitCardPrintArea.style.marginRight = '';
    }
    if (wrap) {
      wrap.style.height = '';
      wrap.style.overflow = '';
    }

    // DIRECT SYNCHRONOUS CALL:
    // Calling window.print() synchronously inside user gesture guarantees
    // it will NEVER be blocked by Android Chrome or iOS popup blockers!
    window.print();
  }

  window.addEventListener('beforeprint', () => {
    if (admitCardPrintArea) {
      admitCardPrintArea.style.transform = '';
      admitCardPrintArea.style.marginLeft = '';
      admitCardPrintArea.style.marginRight = '';
    }
  });

  window.addEventListener('afterprint', () => {
    adjustMobileScale();
  });

  function downloadPDF() {
    // Both download and print buttons open the high-fidelity native print/save dialog
    // which renders 100% perfect Devanagari Hindi typography without mangling ligatures!
    triggerPrint();
  }

  // Button Listeners
  btnPrintCard.addEventListener('click', triggerPrint);
  if (btnPrintCardBottom) {
    btnPrintCardBottom.addEventListener('click', triggerPrint);
  }

  btnDownloadPdf.addEventListener('click', downloadPDF);
  if (btnDownloadPdfBottom) {
    btnDownloadPdfBottom.addEventListener('click', downloadPDF);
  }

  btnScrollPreview.addEventListener('click', () => {
    admitCardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ------------------------------------------------------------------
  // Student Directory / Roster Modal
  // ------------------------------------------------------------------
  function populateRoster() {
    const selectedClass = classFilterSelect.value;
    const query = nameFilterInput.value.trim().toLowerCase();

    const filtered = allStudents.filter(s => {
      const matchClass = (selectedClass === 'ALL' || s.class.toUpperCase() === selectedClass.toUpperCase());
      const matchName = !query || 
        (s.name && s.name.toLowerCase().includes(query)) || 
        (s.fatherName && s.fatherName.toLowerCase().includes(query)) ||
        (s.rollNo && s.rollNo.toString().includes(query));
      return matchClass && matchName;
    });

    rosterTableBody.innerHTML = '';
    rosterCount.textContent = `${filtered.length} विद्यार्थी उपलब्ध`;

    if (filtered.length === 0) {
      rosterTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 24px; color: #64748b;">
            कोई विद्यार्थी नहीं मिला। कृपया कक्षा अथवा नाम की जाँच करें।
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${s.rollNo}</strong></td>
        <td>${s.name || '—'}</td>
        <td>${s.fatherName || '—'}</td>
        <td><span class="badge-class">${s.class}</span></td>
        <td>
          <button type="button" class="btn-select-roster" data-roll="${s.rollNo}">
            चुनें (Select)
          </button>
        </td>
      `;
      rosterTableBody.appendChild(tr);
    });

    // Add listeners to select buttons
    rosterTableBody.querySelectorAll('.btn-select-roster').forEach(btn => {
      btn.addEventListener('click', () => {
        const roll = btn.getAttribute('data-roll');
        rosterModal.style.display = 'none';
        rollInput.value = roll;
        handleSearch(roll);
      });
    });
  }

  btnOpenRoster.addEventListener('click', () => {
    rosterModal.style.display = 'flex';
    nameFilterInput.value = '';
    populateRoster();
    nameFilterInput.focus();
  });

  btnCloseRoster.addEventListener('click', () => {
    rosterModal.style.display = 'none';
  });

  btnCloseRosterFooter.addEventListener('click', () => {
    rosterModal.style.display = 'none';
  });

  classFilterSelect.addEventListener('change', populateRoster);
  nameFilterInput.addEventListener('input', populateRoster);

  // Close modals on clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === rosterModal) rosterModal.style.display = 'none';
    if (e.target === helpModal) helpModal.style.display = 'none';
  });

  // ------------------------------------------------------------------
  // Help Modal
  // ------------------------------------------------------------------
  btnOpenHelp.addEventListener('click', () => {
    helpModal.style.display = 'flex';
  });

  btnCloseHelp.addEventListener('click', () => {
    helpModal.style.display = 'none';
  });

  btnCloseHelpFooter.addEventListener('click', () => {
    helpModal.style.display = 'none';
  });

  // Keyboard escape key support for modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      rosterModal.style.display = 'none';
      helpModal.style.display = 'none';
    }
  });

  // Check if roll number passed in URL query param (e.g. ?roll=1001)
  const urlParams = new URLSearchParams(window.location.search);
  const rollParam = urlParams.get('roll');
  if (rollParam) {
    rollInput.value = rollParam;
    handleSearch(rollParam);
  } else {
    // Auto-focus search input on initial load
    rollInput.focus();
  }
});
