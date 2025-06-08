const SECTION_ICONS = {
  'A': '/icons/a.png',
  'B': '/icons/b.png',
  'C': '/icons/c.png',
  'D': '/icons/d.png',
  'default': '/icon-192x192.png'
};

const activeAlarms = new Map();

function getIconForSection(section) {
  return SECTION_ICONS[section] || SECTION_ICONS.default;
}

async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('reminders-db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('reminders')) {
        db.createObjectStore('reminders');
      }
      if (!db.objectStoreNames.contains('completed')) {
        db.createObjectStore('completed');
      }
    };
  });
}

async function getReminders() {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('reminders', 'readonly');
    const store = tx.objectStore('reminders');
    const request = store.get('current');
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function checkAndNotifyReminders() {
  console.log('🔍 Checking reminders...', new Date().toLocaleTimeString());

  try {
    const reminders = await getReminders();
    const currentTime = Date.now();

    for (const reminder of reminders) {
      const timeSinceCreation = currentTime - reminder.createdAt;
      const triggerInterval = 1000; // 1 second for testing

      if (timeSinceCreation >= triggerInterval) {
        const alarmKey = `alarm-${reminder.id}`;

        if (!activeAlarms.has(alarmKey)) {
          activeAlarms.set(alarmKey, {
            reminderId: reminder.id,
            startTime: currentTime,
            notificationSent: true
          });

          const icon = getIconForSection(reminder.section);

          self.registration.showNotification('🚨 Reminder Alert', {
            body: `Order #${reminder.orderNumber} in ${reminder.section}`,
            icon,
            tag: reminder.id
          });
        }
      }
    }
  } catch (err) {
    console.error('❌ Error checking reminders:', err);
  }
}

self.addEventListener('message', (event) => {
  const { type, reminderId } = event.data || {};

  if (type === 'TRIGGER_CHECK') {
    checkAndNotifyReminders();
  }

  if (type === 'CLEANUP_ALARM' && reminderId) {
    activeAlarms.delete(`alarm-${reminderId}`);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window' }).then(clientsArr => {
    const client = clientsArr.find(c => c.focused) || clientsArr[0];
    if (client) client.focus();
  }));
});
