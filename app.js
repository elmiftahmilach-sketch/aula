const STORAGE_KEY = 'school_bell_schedule_v1';
const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const weekdayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const currentTimeEl = document.getElementById('currentTime');
const currentDateEl = document.getElementById('currentDate');
const nextBellEl = document.getElementById('nextBell');
const alarmStatusEl = document.getElementById('alarmStatus');
const toggleAlarmBtn = document.getElementById('toggleAlarm');
const playDemoBtn = document.getElementById('playDemo');
const presetScheduleBtn = document.getElementById('presetSchedule');
const requestNotifBtn = document.getElementById('requestNotif');
const bellForm = document.getElementById('bellForm');
const bellTimeInput = document.getElementById('bellTime');
const bellLabelInput = document.getElementById('bellLabel');
const bellSoundFile = document.getElementById('bellSoundFile');
const clearSoundBtn = document.getElementById('clearSound');
const soundNameEl = document.getElementById('soundName');
const customMediaEl = document.getElementById('customMedia');
const daySelectors = document.getElementById('daySelectors');
const scheduleListEl = document.getElementById('scheduleList');
const clearAllBtn = document.getElementById('clearAll');
const resetFormBtn = document.getElementById('resetForm');
const messageEl = document.getElementById('message');
const toastEl = document.getElementById('toast');
const editIdInput = document.getElementById('editId');

let alarmEnabled = false;
let alarmTimer = null;
let schedules = [];
let lastTriggerKey = null;
let audioCtx = null;
let customMediaUrl = null;
let customMediaName = 'default';

async function loadSchedules() {
  try {
    const res = await fetch('/api/schedules');
    if (!res.ok) throw new Error('Failed to load from server');
    const data = await res.json();
    if (Array.isArray(data)) return data;
  } catch {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(data)) return data;
    } catch {
      return [];
    }
  }
  return [];
}

async function saveSchedules() {
  try {
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedules),
    });
    if (!res.ok) throw new Error('Failed to save to server');
    return await res.json();
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  }
}

function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('visible');
  setTimeout(() => toastEl.classList.remove('visible'), 1800);
}

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.className = isError ? 'msg error' : 'msg';
  if (!text) messageEl.classList.add('hidden');
  else messageEl.classList.remove('hidden');
}

function toMinutes(time) {
  const [hours, minutes] = (time || '00:00').split(':').map(Number);
  return hours * 60 + minutes;
}

function formatDays(days) {
  if (!days || !days.length) return 'Semua Hari';
  if (days.length === 7) return 'Setiap Hari';
  return days.map(day => day.slice(0, 3)).join(', ');
}

function setCustomMedia(file) {
  if (!file) {
    customMediaName = 'default';
    soundNameEl.textContent = 'Menggunakan suara default';
    bellSoundFile.value = '';
    if (customMediaUrl) {
      URL.revokeObjectURL(customMediaUrl);
      customMediaUrl = null;
    }
    customMediaEl.src = '';
    return;
  }

  if (customMediaUrl) {
    URL.revokeObjectURL(customMediaUrl);
  }

  customMediaUrl = URL.createObjectURL(file);
  customMediaName = file.name;
  soundNameEl.textContent = `Media: ${customMediaName}`;
  customMediaEl.src = customMediaUrl;
  customMediaEl.load();
}

function handleSoundFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  setCustomMedia(file);
  showToast(`File kustom siap: ${file.name}`);
}

function createDayInputs() {
  daySelectors.innerHTML = '';
  dayNames.forEach((name, index) => {
    const label = document.createElement('label');
    label.innerHTML = `<span>${name}</span><input type="checkbox" name="bellDays" value="${name}" checked />`;
    daySelectors.appendChild(label);
  });
}

function getSelectedDays() {
  return Array.from(document.querySelectorAll('[name="bellDays"]:checked')).map(el => el.value);
}

function setSelectedDays(days) {
  document.querySelectorAll('[name="bellDays"]').forEach(el => {
    el.checked = days.includes(el.value);
  });
}

function renderSchedule() {
  scheduleListEl.innerHTML = '';
  if (!schedules.length) {
    scheduleListEl.innerHTML = '<tr><td colspan="5">Belum ada jadwal bel.</td></tr>';
    return;
  }

  schedules.sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

  schedules.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.time}</td>
      <td>${item.label}</td>
      <td>${formatDays(item.days)}</td>
      <td>
        <div class="action-btns">
          <button type="button" data-action="edit" data-id="${item.id}">Edit</button>
          <button type="button" class="secondary" data-action="delete" data-id="${item.id}">Hapus</button>
        </div>
      </td>
    `;
    scheduleListEl.appendChild(row);
  });
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
  currentDateEl.textContent = `${dayNames[now.getDay()]}, ${now.toLocaleDateString('id-ID')}`;
  updateNextBell();
}

function updateNextBell() {
  if (!schedules.length) {
    nextBellEl.textContent = 'Selanjutnya: Tidak ada jadwal aktif';
    return;
  }

  const now = new Date();
  const todayName = dayNames[now.getDay()];
  const currentMinutes = toMinutes(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  const upcoming = [];

  schedules.forEach(item => {
    if (item.days.includes(todayName)) {
      const itemMinutes = toMinutes(item.time);
      if (itemMinutes >= currentMinutes) {
        upcoming.push({ item, minutes: itemMinutes });
      }
    }
  });

  if (upcoming.length === 0) {
    nextBellEl.textContent = 'Selanjutnya: Tidak ada jadwal hari ini';
    return;
  }

  upcoming.sort((a, b) => a.minutes - b.minutes);
  nextBellEl.textContent = `Selanjutnya: ${upcoming[0].item.time} — ${upcoming[0].item.label}`;
}

function ensureAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playBellSound() {
  if (customMediaUrl) {
    customMediaEl.currentTime = 0;
    customMediaEl.play().catch(() => {
      showToast('File kustom tidak dapat diputar otomatis.', true);
    });
    return;
  }

  const ctx = ensureAudioContext();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.16, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
  gain.connect(ctx.destination);

  const frequencies = [880, 660, 520];
  frequencies.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);
    osc.connect(gain);
    osc.start(ctx.currentTime + index * 0.15);
    osc.stop(ctx.currentTime + index * 0.15 + 0.35);
  });
}

function triggerBell(item) {
  const label = item.label || 'Bel sekolah';
  showToast(`Bunyi bel: ${label}`);

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Bel Sekolah', { body: label });
  }

  playBellSound();
}

function applyPresetSchedule() {
  const preset = [
    { time: '06:45', label: 'Persiapan Siswa', days: weekdayNames },
    { time: '07:00', label: 'Bel Masuk', days: weekdayNames },
    { time: '08:30', label: 'Istirahat 1', days: weekdayNames },
    { time: '09:15', label: 'Pelajaran Lanjut', days: weekdayNames },
    { time: '10:30', label: 'Istirahat 2', days: weekdayNames },
    { time: '11:00', label: 'Pelajaran Siang', days: weekdayNames },
    { time: '12:00', label: 'Istirahat Siang', days: weekdayNames },
    { time: '12:30', label: 'Bel Pulang', days: weekdayNames },
    { time: '06:45', label: 'Jam Masuk Hari Sekolah', days: ['Sabtu'] },
    { time: '12:00', label: 'Jam Pulang Hari Sabtu', days: ['Sabtu'] }
  ];

  schedules = preset.map((entry) => ({
    id: crypto.randomUUID(),
    time: entry.time,
    label: entry.label,
    days: entry.days,
  }));

  saveSchedules();
  renderSchedule();
  resetForm();
  updateNextBell();
  showToast('Preset jadwal sekolah diterapkan');
}

function requestDesktopNotification() {
  if (!('Notification' in window)) {
    showToast('Browser tidak mendukung notifikasi desktop');
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      showToast('Notifikasi desktop aktif');
      new Notification('Bel Sekolah', { body: 'Notifikasi desktop sudah aktif.' });
      return;
    }

    showToast('Notifikasi desktop ditolak');
  }).catch(() => {
    showToast('Gagal mengaktifkan notifikasi desktop');
  });
}

function checkAlarms() {
  if (!alarmEnabled) return;
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const todayName = dayNames[now.getDay()];
  const triggerKey = `${todayName}-${currentTime}`;

  if (triggerKey === lastTriggerKey) return;

  const activeItems = schedules.filter(item => item.time === currentTime && item.days.includes(todayName));
  if (activeItems.length) {
    lastTriggerKey = triggerKey;
    activeItems.forEach(triggerBell);
  }
}

function toggleAlarm() {
  alarmEnabled = !alarmEnabled;
  alarmStatusEl.textContent = alarmEnabled ? 'Aktif' : 'Nonaktif';
  toggleAlarmBtn.textContent = alarmEnabled ? 'Nonaktifkan Alarm' : 'Aktifkan Alarm';
  if (alarmEnabled) {
    ensureAudioContext();
    showToast('Alarm bel aktif');
  } else {
    showToast('Alarm bel dinonaktifkan');
  }
}

function resetForm() {
  bellForm.reset();
  editIdInput.value = '';
  setSelectedDays(dayNames.slice(1, 6));
  showMessage('');
}

function getFormData() {
  return {
    id: editIdInput.value || crypto.randomUUID(),
    time: bellTimeInput.value,
    label: bellLabelInput.value.trim(),
    days: getSelectedDays(),
  };
}

function validateForm(data) {
  if (!data.time) return 'Waktu bel harus diisi.';
  if (!data.label) return 'Nama kegiatan harus diisi.';
  if (!data.days.length) return 'Pilih minimal satu hari.';
  return '';
}

async function submitForm(event) {
  event.preventDefault();
  const data = getFormData();
  const error = validateForm(data);
  if (error) {
    showMessage(error, true);
    return;
  }

  const existingIndex = schedules.findIndex(item => item.id === data.id);
  if (existingIndex >= 0) {
    schedules[existingIndex] = data;
    showToast('Jadwal diperbarui');
  } else {
    schedules.push(data);
    showToast('Jadwal baru ditambahkan');
  }

  await saveSchedules();
  renderSchedule();
  resetForm();
}

async function handleScheduleAction(event) {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!id) return;

  if (action === 'delete') {
    schedules = schedules.filter(item => item.id !== id);
    await saveSchedules();
    renderSchedule();
    showToast('Jadwal dihapus');
    return;
  }

  if (action === 'edit') {
    const item = schedules.find(item => item.id === id);
    if (!item) return;
    bellTimeInput.value = item.time;
    bellLabelInput.value = item.label;
    editIdInput.value = item.id;
    setSelectedDays(item.days);
    showMessage('Mode edit aktif. Tekan Simpan untuk memperbarui.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

async function clearAllSchedules() {
  if (!confirm('Hapus semua jadwal bel?')) return;
  schedules = [];
  await saveSchedules();
  renderSchedule();
  showToast('Semua jadwal dihapus');
}

async function init() {
  createDayInputs();
  schedules = await loadSchedules();
  renderSchedule();
  resetForm();
  updateClock();

  setInterval(() => {
    updateClock();
    checkAlarms();
  }, 1000);

  toggleAlarmBtn.addEventListener('click', toggleAlarm);
  playDemoBtn.addEventListener('click', () => {
    ensureAudioContext();
    playBellSound();
    showToast('Uji suara bel berhasil');
  });
  presetScheduleBtn.addEventListener('click', applyPresetSchedule);
  requestNotifBtn.addEventListener('click', requestDesktopNotification);
  bellSoundFile.addEventListener('change', handleSoundFileSelect);
  clearSoundBtn.addEventListener('click', () => setCustomMedia(null));
  bellForm.addEventListener('submit', submitForm);
  resetFormBtn.addEventListener('click', resetForm);
  clearAllBtn.addEventListener('click', clearAllSchedules);
  scheduleListEl.addEventListener('click', handleScheduleAction);
}

init();
