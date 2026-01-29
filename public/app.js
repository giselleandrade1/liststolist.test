/**
 * LembraFácil - Sistema Universal de Tarefas
 * Arquitetura: Clean Architecture + Offline First
 * Acessibilidade: WCAG 2.1 AAA
 */

// ============================================
// CORE LAYER - Entities & Business Logic
// ============================================

class Task {
  constructor(id, text, color, done, createdAt, updatedAt) {
    this.id = id;
    this.text = text;
    this.color = color;
    this.done = done;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(text, color = 'yellow') {
    const now = new Date().toISOString();
    return new Task(
      this.generateId(),
      text.trim().substring(0, 100),
      color,
      false,
      now,
      now
    );
  }

  static generateId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  markAsDone() {
    return new Task(
      this.id,
      this.text,
      'green',
      true,
      this.createdAt,
      new Date().toISOString()
    );
  }

  changeColor(newColor) {
    return new Task(
      this.id,
      this.text,
      newColor,
      this.done,
      this.createdAt,
      new Date().toISOString()
    );
  }
}

// ============================================
// INFRASTRUCTURE - Persistence Layer
// ============================================

class MultiLayerPersistence {
  constructor() {
    this.memoryCache = [];
    this.storageKey = 'lembrafacil-tasks';
  }

  async save(tasks) {
    // Memory cache (instant)
    this.memoryCache = tasks;
    
    // LocalStorage (persistent)
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    } catch (error) {
      console.warn('Storage full, clearing old data');
      this.clearOldTasks();
      localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    }
  }

  async load() {
    // Try memory first
    if (this.memoryCache.length > 0) {
      return this.memoryCache;
    }

    // Try localStorage
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.memoryCache = JSON.parse(data);
        return this.memoryCache;
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }

    return [];
  }

  clearOldTasks() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      const tasks = JSON.parse(data);
      const recent = tasks.filter(t => {
        const age = Date.now() - new Date(t.createdAt).getTime();
        return age < 30 * 24 * 60 * 60 * 1000; // Keep last 30 days
      });
      localStorage.setItem(this.storageKey, JSON.stringify(recent));
    }
  }
}

// ============================================
// ACCESSIBILITY MANAGER
// ============================================

class AccessibilityManager {
  constructor() {
    this.announcer = this.createAnnouncer();
    this.setupKeyboardNavigation();
    this.detectUserPreferences();
  }

  createAnnouncer() {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
    return announcer;
  }

  announce(message, priority = 'polite') {
    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = '';
    setTimeout(() => {
      this.announcer.textContent = message;
    }, 100);
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Escape fecha modais
      if (e.key === 'Escape') {
        const addScreen = document.getElementById('addScreen');
        if (addScreen && !addScreen.classList.contains('hidden')) {
          app.closeAddScreen();
        }
      }
    });
  }

  detectUserPreferences() {
    // High contrast mode
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.documentElement.setAttribute('data-contrast', 'high');
    }

    // Reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.setAttribute('data-motion', 'reduce');
    }

    // Dark mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }
}

// ============================================
// APPLICATION - Main Controller
// ============================================

class LembraFacilApp {
  constructor() {
    this.tasks = [];
    this.persistence = new MultiLayerPersistence();
    this.accessibility = new AccessibilityManager();
    this.currentFilter = 'all';
  }

  async init() {
    await this.loadTasks();
    this.setupEventListeners();
    this.render();
    this.showOnboarding();
  }

  async loadTasks() {
    this.tasks = await this.persistence.load();
  }

  async saveTasks() {
    await this.persistence.save(this.tasks);
  }

  setupEventListeners() {
    // Add button
    document.getElementById('addButton').addEventListener('click', () => {
      this.openAddScreen();
    });

    // Add button (keyboard)
    document.getElementById('addButton').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openAddScreen();
      }
    });

    // Close add screen
    document.getElementById('closeAddScreen').addEventListener('click', () => {
      this.closeAddScreen();
    });

    // Save task
    document.getElementById('saveTask').addEventListener('click', () => {
      this.saveNewTask();
    });

    // Task input (Enter key)
    document.getElementById('taskInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.saveNewTask();
      }
    });

    // Emoji buttons
    document.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const emoji = e.target.textContent;
        const input = document.getElementById('taskInput');
        input.value += emoji;
        input.focus();
      });
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentFilter = e.target.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(b => 
          b.classList.remove('active'));
        e.target.classList.add('active');
        this.render();
      });
    });

    // Voice input (if supported)
    if ('webkitSpeechRecognition' in window) {
      this.setupVoiceInput();
    }
  }

  setupVoiceInput() {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;

    document.getElementById('voiceButton')?.addEventListener('click', () => {
      recognition.start();
      this.accessibility.announce('Fale agora');
    });

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      document.getElementById('taskInput').value = text;
      this.accessibility.announce(`Você disse: ${text}`);
    };
  }

  openAddScreen() {
    document.getElementById('addScreen').classList.remove('hidden');
    document.getElementById('taskInput').focus();
    this.accessibility.announce('Tela de adicionar tarefa aberta');
  }

  closeAddScreen() {
    document.getElementById('addScreen').classList.add('hidden');
    document.getElementById('taskInput').value = '';
    document.getElementById('addButton').focus();
    this.accessibility.announce('Voltou para lista de tarefas');
  }

  async saveNewTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();

    if (!text) {
      this.accessibility.announce('Digite algo para adicionar', 'assertive');
      return;
    }

    const task = Task.create(text, 'yellow');
    this.tasks.unshift(task);
    await this.saveTasks();
    
    this.closeAddScreen();
    this.render();
    this.showSuccessAnimation();
    this.accessibility.announce(`Tarefa "${text}" adicionada com sucesso`);
  }

  async toggleTask(taskId) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;

    const task = this.tasks[index];
    this.tasks[index] = task.markAsDone();
    await this.saveTasks();
    this.render();
    
    this.showCompletionAnimation(taskId);
    this.accessibility.announce(`Tarefa "${task.text}" marcada como concluída`);
  }

  async changeTaskColor(taskId, color) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;

    const task = this.tasks[index];
    this.tasks[index] = task.changeColor(color);
    await this.saveTasks();
    this.render();
    
    const colorNames = {
      red: 'vermelho - importante agora',
      yellow: 'amarelo - pode fazer depois',
      green: 'verde - concluída',
      blue: 'azul - alguém vai ajudar'
    };
    this.accessibility.announce(`Cor mudada para ${colorNames[color]}`);
  }

  showColorPicker(taskId, event) {
    event.stopPropagation();
    
    const existingPicker = document.querySelector('.color-picker');
    if (existingPicker) {
      existingPicker.remove();
    }

    const picker = document.createElement('div');
    picker.className = 'color-picker';
    picker.innerHTML = `
      <button class="color-option color-red" data-color="red" aria-label="Importante agora">🔴</button>
      <button class="color-option color-yellow" data-color="yellow" aria-label="Pode fazer depois">🟡</button>
      <button class="color-option color-blue" data-color="blue" aria-label="Alguém vai ajudar">🔵</button>
    `;

    const taskCard = event.currentTarget.closest('.task-card');
    taskCard.appendChild(picker);

    picker.querySelectorAll('.color-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.changeTaskColor(taskId, btn.dataset.color);
        picker.remove();
      });
    });

    setTimeout(() => {
      document.addEventListener('click', () => picker.remove(), { once: true });
    }, 100);
  }

  getFilteredTasks() {
    switch (this.currentFilter) {
      case 'pending':
        return this.tasks.filter(t => !t.done);
      case 'done':
        return this.tasks.filter(t => t.done);
      default:
        return this.tasks;
    }
  }

  render() {
    const container = document.getElementById('taskList');
    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✨</div>
          <p class="empty-text">Nenhuma tarefa ainda</p>
          <p class="empty-hint">Toque no + para adicionar</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredTasks.map(task => `
      <div 
        class="task-card task-${task.color} ${task.done ? 'task-done' : ''}"
        data-task-id="${task.id}"
        role="button"
        tabindex="0"
        aria-label="${task.text}. ${task.done ? 'Concluída' : 'Pendente'}. Toque para marcar como feita. Toque longo para mudar cor."
      >
        <div class="task-content">
          <span class="task-text">${task.text}</span>
          ${task.done ? '<span class="task-check">✓</span>' : ''}
        </div>
        <button 
          class="task-color-btn"
          aria-label="Mudar cor da tarefa"
        >🎨</button>
      </div>
    `).join('');

    // Add event listeners to task cards
    container.querySelectorAll('.task-card').forEach(card => {
      const taskId = card.dataset.taskId;
      
      // Click to toggle
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('task-color-btn')) {
          this.toggleTask(taskId);
        }
      });

      // Keyboard support
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleTask(taskId);
        }
      });

      // Color button
      const colorBtn = card.querySelector('.task-color-btn');
      colorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showColorPicker(taskId, e);
      });
    });

    // Update counter
    const pendingCount = this.tasks.filter(t => !t.done).length;
    document.getElementById('taskCounter').textContent = 
      pendingCount === 0 ? 'Tudo pronto!' : 
      pendingCount === 1 ? '1 tarefa' : 
      `${pendingCount} tarefas`;
  }

  showSuccessAnimation() {
    const animation = document.createElement('div');
    animation.className = 'success-animation';
    animation.textContent = '✓';
    document.body.appendChild(animation);
    setTimeout(() => animation.remove(), 1000);
  }

  showCompletionAnimation(taskId) {
    const card = document.querySelector(`[data-task-id="${taskId}"]`);
    if (card) {
      card.style.animation = 'taskComplete 0.5s ease';
    }
  }

  showOnboarding() {
    const hasSeenOnboarding = localStorage.getItem('lembrafacil-onboarding');
    if (!hasSeenOnboarding && this.tasks.length === 0) {
      setTimeout(() => {
        const addButton = document.getElementById('addButton');
        addButton.classList.add('pulse');
        this.accessibility.announce('Bem-vindo! Toque no botão de mais para começar');
        
        setTimeout(() => {
          addButton.classList.remove('pulse');
          localStorage.setItem('lembrafacil-onboarding', 'true');
        }, 3000);
      }, 1000);
    }
  }
}

// ============================================
// INITIALIZE APP
// ============================================

let app;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  app = new LembraFacilApp();
  app.init();
}

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}
